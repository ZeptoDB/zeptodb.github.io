#!/usr/bin/env node
/**
 * Copies docs from zeptodb/docs to src/content/docs,
 * adding frontmatter (title) where missing.
 * All filenames lowercased (Starlight normalizes slugs to lowercase).
 * Korean .ko.md files go to src/content/docs/ko/
 *
 * Usage: node scripts/sync-docs.mjs [source_dir]
 */

import { readdir, readFile, writeFile, mkdir, cp, rm, rename } from 'node:fs/promises';
import { join, relative, basename, dirname, posix } from 'node:path';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { experimentRouteForSource, experimentRoutes } from '../src/data/experiment-routes.mjs';
import { canonicalSourcePath, internalDocSources, publicDocSources } from '../src/data/public-docs.mjs';

const ROOT = join(import.meta.dirname, '..');
const SOURCE = process.argv[2] || process.env.ZEPTODB_DOCS_PATH || join(import.meta.dirname, '..', '..', 'zeptodb', 'docs');
const DEST = join(ROOT, 'src', 'content', 'docs');
const NEXT_DEST = `${DEST}-next-${process.pid}`;
const BACKUP_DEST = `${DEST}-backup-${process.pid}`;
const SYNC_MANIFEST = join(ROOT, 'public', 'docs-sync.json');
const ALLOW_STALE_DOCS = process.env.ZEPTODB_ALLOW_STALE_DOCS === '1';

const SKIP = new Set(['assets', 'requirements.txt', 'requirements']);
// Directories that are internal-only (not for public docs site)
const INTERNAL = new Set([
  'business', 'devlog', 'design', 'bench', 'community', 'feeds', 'ops', 'usecases',
]);
const MAPPED_EXPERIMENT_IDS = new Set(experimentRoutes.map((route) => route.key.match(/^\d{3}/)?.[0]).filter(Boolean));
const PUBLIC_DOC_ALIASES = new Map([
  ['deployment/kubernetes_ops.md', 'operations/kubernetes_operations.md'],
  ['deployment/monitoring.md', 'operations/production_operations.md'],
  ['ops/rolling_upgrade.md', 'operations/rolling_upgrade.md'],
]);

function visibilityForSource(rel) {
  const normalized = canonicalSourcePath(rel);
  if (normalized === 'index.md' || internalDocSources.has(normalized)) return 'internal';
  if (publicDocSources.has(normalized)) return 'public';

  if (/^research\/[^/]*_experiment_\d{3}\.md$/.test(normalized)) {
    return experimentRouteForSource(basename(normalized)) ? 'public' : 'unclassified';
  }

  const resultId = normalized.startsWith('research/results/')
    ? normalized.match(/_(\d{3})(?:_[^/]*)?\.md$/)?.[1]
    : undefined;
  if (resultId && MAPPED_EXPERIMENT_IDS.has(resultId)) return 'public';

  return 'unclassified';
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function cleanDescription(value) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMetadataOrCommand(line) {
  return /^[*_]*(?:generated at|last updated|effective date|date started|status|branch|fixture|fixtures|quality labels?|classification|cluster|owner|command)\s*:/i.test(line)
    || /^(?:cd |docker |python\d* |pnpm |npm |cargo |cmake |make |\.\/|\$ )/i.test(line)
    || /^[-*+]\s|^\d+[.)]\s|^>\s|^\|/.test(line);
}

function fallbackDescription(title) {
  return `${title} for ZeptoDB, including behavior, configuration, examples, validation, and operational guidance.`;
}

function extractDescription(body, title) {
  const paragraphs = [];
  let paragraph = [];
  let inCode = false;

  const flush = () => {
    if (!paragraph.length) return;
    const clean = cleanDescription(paragraph.join(' '));
    if (clean.length >= 50) paragraphs.push(clean);
    paragraph = [];
  };

  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCode = !inCode;
      flush();
      continue;
    }
    const candidate = trimmed.replace(/^>\s*/, '');
    if (inCode || candidate.startsWith('#') || candidate === '---' || isMetadataOrCommand(candidate)) {
      flush();
      continue;
    }
    if (!candidate) {
      flush();
      continue;
    }
    paragraph.push(candidate);
  }
  flush();

  const description = paragraphs[0] || fallbackDescription(title);
  return description.length > 160 ? `${description.slice(0, 157).trimEnd()}...` : description;
}

function isWeakDescription(description) {
  const raw = description.replace(/^['"]|['"]$/g, '').trim();
  const value = cleanDescription(raw);
  return raw.startsWith('>')
    || value.length < 50
    || /^(?:generated at|last updated|effective date|date started|status|branch|fixture|docker |cd |\.\/)/i.test(value);
}

function rawResearchMetadata(rel) {
  const normalizedRel = rel.replaceAll('\\', '/').toLowerCase();
  const isRawArtifact = normalizedRel.startsWith('research/results/')
    || normalizedRel === 'research/action_outcome_research_process_log.md';
  if (!isRawArtifact) return null;

  const acronyms = new Map([
    ['ai', 'AI'],
    ['aiops', 'AIOps'],
    ['cpp', 'C++'],
    ['sql', 'SQL'],
  ]);
  const label = basename(rel, '.md')
    .split(/[_-]+/)
    .map((word) => acronyms.get(word.toLowerCase()) || `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

  return {
    title: `${label} - Raw Research Artifact`,
    description: `Raw ZeptoDB experiment output for ${label}, published as replayable evidence for independent review.`,
  };
}

function setFrontmatterField(frontmatter, key, value) {
  const serialized = typeof value === 'boolean' ? String(value) : `"${String(value).replace(/"/g, '\\"')}"`;
  const field = `${key}: ${serialized}`;
  const pattern = new RegExp(`^${key}:\\s*.*$`, 'm');
  return pattern.test(frontmatter) ? frontmatter.replace(pattern, field) : `${frontmatter}\n${field}`;
}

function publicDestinationRel(rel) {
  const normalized = rel.replaceAll('\\', '/').toLowerCase();
  if (!normalized.startsWith('research/')) return rel;
  const experimentRoute = experimentRouteForSource(basename(normalized));
  return experimentRoute ? `experiments/${experimentRoute.slug}.md` : rel;
}

function setExperimentPresentation(content, rel) {
  if (!rel.replaceAll('\\', '/').startsWith('experiments/')) return content;
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return content;
  let frontmatter = setFrontmatterField(match[1], 'template', 'splash');
  frontmatter = setFrontmatterField(frontmatter, 'tableOfContents', false);
  const publishedAt = match[2].match(/^\*{0,2}Date\*{0,2}:\s*(\d{4}-\d{2}-\d{2})\s*$/mi)?.[1];
  if (publishedAt) frontmatter = setFrontmatterField(frontmatter, 'publishedAt', publishedAt);
  return `---\n${frontmatter}\n---\n\n${match[2].replace(/^\n+/, '')}`;
}

function addFrontmatter(content, fallbackTitle, rel) {
  const rawMetadata = rawResearchMetadata(rel);
  if (content.startsWith('---')) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return content;
    if (rawMetadata) {
      let nextFrontmatter = setFrontmatterField(match[1], 'title', rawMetadata.title);
      nextFrontmatter = setFrontmatterField(nextFrontmatter, 'description', rawMetadata.description);
      nextFrontmatter = setFrontmatterField(nextFrontmatter, 'pagefind', false);
      return `---\n${nextFrontmatter}\n---\n\n${match[2].replace(/^\n+/, '')}`;
    }
    const titleLine = match[1].match(/^title:\s*["']?(.*?)["']?\s*$/m);
    const descriptionLine = match[1].match(/^description:\s*(.*?)\s*$/m);
    const title = titleLine?.[1] || extractTitle(match[2]) || fallbackTitle;
    if (descriptionLine && !isWeakDescription(descriptionLine[1])) return content;

    const description = extractDescription(match[2], title).replace(/"/g, '\\"');
    const nextFrontmatter = descriptionLine
      ? match[1].replace(/^description:\s*.*$/m, `description: "${description}"`)
      : `${match[1]}\ndescription: "${description}"`;
    return `---\n${nextFrontmatter}\n---\n\n${match[2].replace(/^\n+/, '')}`;
  }

  const title = rawMetadata?.title || extractTitle(content) || fallbackTitle;
  // Remove the first # heading that matches the title to avoid duplication
  const body = content.replace(/^#\s+.+\n*/m, '');
  const description = rawMetadata?.description || extractDescription(body, title);
  const pagefind = rawMetadata ? '\npagefind: false' : '';
  return `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndescription: "${description.replace(/"/g, '\\"')}"${pagefind}\n---\n\n${body}`;
}

/**
 * Rewrite markdown internal links from source-repo style (.md references)
 * to Starlight-compatible slug paths.
 *
 * Handles: UPPER.md, path/UPPER.md, ../path/UPPER.md, UPPER_ko.md, #anchors
 */
function rewriteLinks(content, isKorean, rel) {
  const rewrittenDocs = content.replace(
    /\]\(([^)]*\.md(?:#[^)]*)?)\)/g,
    (match, rawHref) => {
      if (/^[a-z][a-z0-9+.-]*:/i.test(rawHref)) return match;

      // Split anchor
      const [pathPart, anchor] = rawHref.split('#');
      const anchorSuffix = anchor ? `#${anchor}` : '';
      const isKoLink = /(?:\.ko|_ko)\.md$/i.test(pathPart);

      let targetRel;
      if (pathPart.startsWith('/docs/')) {
        targetRel = pathPart.slice('/docs/'.length);
      } else if (pathPart.startsWith('docs/')) {
        targetRel = pathPart.slice('docs/'.length);
      } else if (pathPart.startsWith('/')) {
        targetRel = pathPart.slice(1);
      } else {
        targetRel = posix.normalize(posix.join(posix.dirname(rel), pathPart));
      }

      const normalizedTarget = targetRel.toLowerCase();
      targetRel = PUBLIC_DOC_ALIASES.get(normalizedTarget) || targetRel;
      const publicTarget = targetRel.toLowerCase();
      const topDirectory = publicTarget.split('/')[0];
      const isInternal = INTERNAL.has(topDirectory) || visibilityForSource(targetRel) !== 'public';

      if (targetRel.startsWith('../') || isInternal) {
        const repoPath = targetRel.startsWith('../')
          ? posix.normalize(posix.join('docs', posix.dirname(rel), pathPart))
          : posix.join('docs', targetRel);
        return `](https://github.com/zeptodb/zeptodb/blob/main/${repoPath}${anchorSuffix})`;
      }

      const experimentRoute = targetRel.toLowerCase().startsWith('research/')
        ? experimentRouteForSource(basename(targetRel).toLowerCase())
        : undefined;
      let route = experimentRoute
        ? `experiments/${experimentRoute.slug}`
        : targetRel
          .replace(/(?:\.ko|_ko)\.md$/i, '.md')
          .replace(/\.md$/i, '')
          .toLowerCase();

      // If the link targets a Korean doc but we're in English content, prefix with /ko
      if (isKoLink && !isKorean) {
        route = `ko/${route}`;
      }

      return `](/${route}/${anchorSuffix})`;
    }
  );

  return rewrittenDocs.replace(
    /\]\((\.\.?\/[^)#]+)(#[^)]*)?\)/g,
    (_match, rawPath, anchor = '') => {
      const repoPath = posix.normalize(posix.join('docs', posix.dirname(rel), rawPath));
      const githubView = rawPath.endsWith('/') ? 'tree' : 'blob';
      return `](https://github.com/zeptodb/zeptodb/${githubView}/main/${repoPath}${anchor})`;
    },
  );
}

function stripSection(content, headingPattern) {
  const lines = content.split('\n');
  const out = [];
  let skipping = false;
  let skipLevel = 0;

  for (const line of lines) {
    const heading = line.match(/^(#{2,6})\s+/);
    if (!skipping && headingPattern.test(line)) {
      skipping = true;
      skipLevel = heading[1].length;
      continue;
    }
    if (skipping && heading && heading[1].length <= skipLevel) {
      skipping = false;
      skipLevel = 0;
    }
    if (!skipping) out.push(line);
  }

  return out.join('\n');
}

function sanitizePublicDocs(content, rel) {
  let out = content;

  out = out
    .replace(/https:\/\/docs\.zeptodb\.com\/getting-started\/quick_start\/?/gi, '/getting-started/quick_start/')
    .replace(/https:\/\/docs\.zeptodb\.com\/?/gi, '/docs/')
    .replace(/https:\/\/discord\.gg\/zeptodb\b/gi, 'https://discord.gg/PAtzvCa7')
    .replace(/skswlsaks@gmail\.com/gi, '[ZeptoDB community](/community/)')
    .replace(/Enterprise Security Operations Guide/g, 'Security Operations Guide')
    .replace(/Enterprise security guide/g, 'Security guide')
    .replace(/enterprise factory workloads/gi, 'multi-site factory workloads')
    .replace(/enterprise workflows/gi, 'operator workflows')
    .replace(/enterprise data streaming ecosystem/gi, 'data streaming ecosystem')
    .replace(/enterprise schema registry integration/gi, 'schema registry integration')
    .replace(/enterprise controls/gi, 'organization controls')
    .replace(/enterprise complexity/gi, 'real operational complexity')
    .replace(/enterprise adoption/gi, 'adoption')
    .replace(/Enterprise buyers/gi, 'Operations teams')
    .replace(/Enterprise feature additions/g, 'Advanced feature additions')
    .replace(/Enterprise support/g, 'Community support')
    .replace(/enterprise support/gi, 'community support')
    .replace(/enterprise-sales/gi, 'launch')
    .replace(/sales differentiator/gi, 'technical differentiator')
    .replace(/sales cycles/gi, 'adoption cycles')
    .replace(/sales estimates/gi, 'public estimates')
    .replace(/procurement/gi, 'adoption review')
    .replace(/managed cloud/gi, 'hosted')
    .replace(/cloud marketplace/gi, 'deployment catalog')
    .replace(/pricing page/gi, 'public site page')
    .replace(/pricing pages/gi, 'public site pages')
    .replace(/pricing/gi, 'cost model');

  out = out
    .split('\n')
    .filter((line) => !/upgrade_url|zeptodb\.com\/pricing|Book a Demo|mailto:sales@zeptodb\.com/i.test(line))
    .join('\n');

  const normalizedRel = rel.toLowerCase();
  if (normalizedRel === 'api/python_reference.md') {
    out = out
      .replace(/\(#apex--pybind11-binding\)/g, '(#zeptodb--pybind11-binding)')
      .replace(/\(#zeptopipeline\)/g, '(#zeptodbpipeline)')
      .replace(/\(#zeptosqlqueryexecutor\)/g, '(#zeptodbsqlqueryexecutor)');
  }
  if (normalizedRel === 'api/http_reference.md') {
    out = out.replace(/^\| `POST` \| `\/admin\/license\/trial`.*\n?/gm, '');
    out = stripSection(out, /^#{2,6}\s+`?POST \/admin\/license\/trial`?|^#{2,6}\s+.*Generate 30-day trial/i);
    out = out
      .replace(/trial\/expiry status/gi, 'feature-gate status')
      .replace(/trial\/expiry/gi, 'feature-gate')
      .replace(/,?\s*"trial":\s*(true|false),?\n/g, '\n')
      .replace(/Enterprise edition:/g, 'Licensed feature-gate example:')
      .replace(/Enterprise trial key/gi, 'local feature-gate key')
      .replace(/30-day trial/gi, 'local feature-gate')
      .replace(/trial keys/gi, 'local feature-gate keys')
      .replace(/trial key/gi, 'local feature-gate key');
  }

  return out;
}

async function getAllMdFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    const normalizedName = entry.name.toLowerCase();
    if (SKIP.has(normalizedName)) continue;
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in public docs source: ${relative(base, full)}`);
    }
    if (entry.isDirectory()) {
      if (INTERNAL.has(normalizedName)) continue;
      files.push(...await getAllMdFiles(full, base));
    } else if (normalizedName.endsWith('.md')) {
      files.push({ full, rel: relative(base, full) });
    }
  }
  return files;
}

function sourceGitOutput(args) {
  try {
    return execFileSync('git', ['-C', dirname(SOURCE), ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function siteGitOutput(args) {
  try {
    return execFileSync('git', ['-C', ROOT, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function assertGitSha(value, label) {
  if (!/^[0-9a-f]{40}$/i.test(value)) throw new Error(`${label} must be an exact 40-character Git SHA; received ${value || 'empty'}`);
}

async function copyManualSiteContent() {
  const trackedOrVisible = siteGitOutput([
    'ls-files', '--cached', '--others', '--exclude-standard', '--', 'src/content/docs',
  ]).split('\n').filter(Boolean);

  for (const repoRel of trackedOrVisible) {
    const src = join(ROOT, repoRel);
    if (!existsSync(src)) continue;
    const destRel = relative(DEST, src);
    if (destRel.startsWith('..')) throw new Error(`Manual content escaped docs root: ${repoRel}`);
    const target = join(NEXT_DEST, destRel);
    await mkdir(dirname(target), { recursive: true });
    await cp(src, target);
  }
}

async function replaceDestination() {
  await rm(BACKUP_DEST, { recursive: true, force: true });
  const hadDestination = existsSync(DEST);
  if (hadDestination) await rename(DEST, BACKUP_DEST);
  try {
    await rename(NEXT_DEST, DEST);
  } catch (error) {
    if (hadDestination && existsSync(BACKUP_DEST) && !existsSync(DEST)) await rename(BACKUP_DEST, DEST);
    throw error;
  }
  await rm(BACKUP_DEST, { recursive: true, force: true });
}

async function writeSyncManifest(enCount, koCount, documents) {
  const actualSourceSha = sourceGitOutput(['rev-parse', 'HEAD']);
  assertGitSha(actualSourceSha, 'Checked-out source SHA');
  const expectedSourceSha = process.env.ZEPTODB_SOURCE_SHA || actualSourceSha;
  assertGitSha(expectedSourceSha, 'Source SHA');
  if (actualSourceSha !== expectedSourceSha) {
    throw new Error(`Checked-out source SHA ${actualSourceSha} does not match requested SHA ${expectedSourceSha}`);
  }
  const siteSha = siteGitOutput(['rev-parse', 'HEAD']);
  assertGitSha(siteSha, 'Site SHA');
  const sourceRef = process.env.ZEPTODB_SOURCE_REF
    || sourceGitOutput(['symbolic-ref', '--short', '-q', 'HEAD'])
    || 'detached';
  const sourceDirty = Boolean(sourceGitOutput(['status', '--porcelain', '--', basename(SOURCE)]));
  const siteDirty = Boolean(siteGitOutput(['status', '--porcelain']));
  const manifest = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    siteRepository: 'https://github.com/ZeptoDB/zeptodb.github.io',
    siteSha,
    siteDirty,
    sourceRepository: 'https://github.com/ZeptoDB/ZeptoDB',
    sourceSha: expectedSourceSha,
    sourceRef,
    sourceDirty,
    englishDocuments: enCount,
    koreanDocuments: koCount,
    totalDocuments: enCount + koCount,
    documents: documents.sort((a, b) => a.destination.localeCompare(b.destination)),
  };
  await mkdir(dirname(SYNC_MANIFEST), { recursive: true });
  await writeFile(SYNC_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  await rm(SYNC_MANIFEST, { force: true });
  if (!existsSync(SOURCE)) {
    const message = `Source not found: ${SOURCE}. Refusing to build from stale generated docs.`;
    if (!ALLOW_STALE_DOCS) throw new Error(`${message} Set ZEPTODB_ALLOW_STALE_DOCS=1 only for an intentional stale-content preview.`);
    console.warn(`${message} ZEPTODB_ALLOW_STALE_DOCS=1 is set, so existing src/content/docs will be kept.`);
    return;
  }

  await rm(NEXT_DEST, { recursive: true, force: true });
  await mkdir(NEXT_DEST, { recursive: true });
  await copyManualSiteContent();

  const files = await getAllMdFiles(SOURCE);
  const unclassified = files
    .map(({ rel }) => rel.replaceAll('\\', '/'))
    .filter((rel) => visibilityForSource(rel) === 'unclassified')
    .sort();
  if (unclassified.length) {
    throw new Error(`Unclassified source docs must be approved or marked internal:\n- ${unclassified.join('\n- ')}`);
  }

  let enCount = 0, koCount = 0;
  const documents = [];
  const destinationOwners = new Map();

  for (const { full, rel } of files) {
    if (visibilityForSource(rel) !== 'public') continue;
    const content = await readFile(full, 'utf-8');
    const publicRel = publicDestinationRel(rel);
    const name = basename(publicRel);
    const dir = dirname(publicRel);
    const isKorean = /(?:\.ko|_ko)\.md$/i.test(name);
    const outputName = isKorean
      ? name.replace(/(?:\.ko|_ko)\.md$/i, '.md').toLowerCase()
      : name.toLowerCase();
    const destPath = isKorean
      ? join(NEXT_DEST, 'ko', dir.toLowerCase(), outputName)
      : join(NEXT_DEST, dir.toLowerCase(), outputName);
    const destination = relative(NEXT_DEST, destPath).replaceAll('\\', '/');
    const existingOwner = destinationOwners.get(destination);
    if (existingOwner) throw new Error(`Public doc destination collision: ${existingOwner} and ${rel} both map to ${destination}`);
    destinationOwners.set(destination, rel);

    const rewritten = sanitizePublicDocs(rewriteLinks(content, isKorean, rel), rel);
    const withFrontmatter = addFrontmatter(rewritten, outputName.replace('.md', ''), rel);
    const renderedSource = setExperimentPresentation(withFrontmatter, publicRel);
    await mkdir(dirname(destPath), { recursive: true });
    await writeFile(destPath, renderedSource);
    documents.push({
      source: rel.replaceAll('\\', '/'),
      destination,
      sha256: createHash('sha256').update(renderedSource).digest('hex'),
    });
    if (isKorean) koCount++;
    else enCount++;
  }

  // Copy assets
  const assetsDir = join(SOURCE, 'assets');
  if (existsSync(assetsDir)) {
    await cp(assetsDir, join(NEXT_DEST, '_assets'), { recursive: true });
  }

  await replaceDestination();
  await writeSyncManifest(enCount, koCount, documents);

  console.log(`✓ Synced ${enCount} EN + ${koCount} KO docs → src/content/docs/`);
}

main().catch(async (error) => {
  await rm(NEXT_DEST, { recursive: true, force: true }).catch(() => {});
  if (existsSync(BACKUP_DEST) && !existsSync(DEST)) {
    await rename(BACKUP_DEST, DEST).catch(() => {});
  }
  await rm(BACKUP_DEST, { recursive: true, force: true }).catch(() => {});
  console.error(error);
  process.exitCode = 1;
});
