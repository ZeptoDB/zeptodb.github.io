#!/usr/bin/env node
/**
 * Copies docs from zeptodb/docs to src/content/docs,
 * adding frontmatter (title) where missing.
 * All filenames lowercased (Starlight normalizes slugs to lowercase).
 * Korean .ko.md files go to src/content/docs/ko/
 *
 * Usage: node scripts/sync-docs.mjs [source_dir]
 */

import { readdir, readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { join, relative, basename, dirname, posix } from 'node:path';
import { existsSync } from 'node:fs';

const SOURCE = process.argv[2] || process.env.ZEPTODB_DOCS_PATH || join(import.meta.dirname, '..', '..', 'zeptodb', 'docs');
const DEST = join(import.meta.dirname, '..', 'src', 'content', 'docs');

const SKIP = new Set(['assets', 'requirements.txt', 'requirements']);
// Directories that are internal-only (not for public docs site)
const INTERNAL = new Set([
  'business', 'devlog', 'design', 'bench', 'community', 'ops',
]);
// Files we manage manually in the repo (don't overwrite)
const MANUAL_FILES = new Set(['index.md']);
// Standalone internal files to exclude (relative to docs root)
const INTERNAL_FILES = new Set([
  'backlog.md', 'completed.md', 'api_reference.md',
  'brand_guidelines.md', 'parquet_s3_activation.md', 'web_ui.md',
]);
const PUBLIC_DOC_ALIASES = new Map([
  ['deployment/kubernetes_ops.md', 'operations/kubernetes_operations.md'],
  ['deployment/monitoring.md', 'operations/production_operations.md'],
  ['ops/rolling_upgrade.md', 'operations/rolling_upgrade.md'],
]);

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

function addFrontmatter(content, fallbackTitle) {
  if (content.startsWith('---')) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return content;
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

  const title = extractTitle(content) || fallbackTitle;
  // Remove the first # heading that matches the title to avoid duplication
  const body = content.replace(/^#\s+.+\n*/m, '');
  const description = extractDescription(body, title);
  return `---\ntitle: "${title.replace(/"/g, '\\"')}"\ndescription: "${description.replace(/"/g, '\\"')}"\n---\n\n${body}`;
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
      const isInternal = INTERNAL.has(topDirectory) || INTERNAL_FILES.has(publicTarget);

      if (targetRel.startsWith('../') || isInternal) {
        const repoPath = targetRel.startsWith('../')
          ? posix.normalize(posix.join('docs', posix.dirname(rel), pathPart))
          : posix.join('docs', targetRel);
        return `](https://github.com/zeptodb/zeptodb/blob/main/${repoPath}${anchorSuffix})`;
      }

      let route = targetRel
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
    (match, rawPath, anchor = '') => {
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
    if (SKIP.has(entry.name)) continue;
    if (entry.isDirectory()) {
      if (INTERNAL.has(entry.name)) continue;
      files.push(...await getAllMdFiles(full, base));
    } else if (entry.name.endsWith('.md')) {
      files.push({ full, rel: relative(base, full) });
    }
  }
  return files;
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.warn(`Source not found: ${SOURCE}. Keeping existing src/content/docs.`);
    return;
  }

  // Clean dest (preserve manually managed files)
  // We re-create from scratch each time, but restore manual files after
  const manualDir = join(import.meta.dirname, '..', 'src', 'content', 'docs-manual');
  // Save manual files
  const manualEntries = [
    'index.mdx', 'docs.mdx', 'features.mdx', 'integrations.mdx',
    'security.mdx', 'community.mdx', 'about.mdx',
  ];
  const manualDirs = ['use-cases', 'compare', 'benchmarks', 'blog', 'research'];
  for (const f of manualEntries) {
    const src = join(DEST, f);
    if (existsSync(src)) {
      await mkdir(manualDir, { recursive: true });
      await cp(src, join(manualDir, f));
    }
  }
  for (const d of manualDirs) {
    const src = join(DEST, d);
    if (existsSync(src)) {
      await mkdir(manualDir, { recursive: true });
      await cp(src, join(manualDir, d), { recursive: true });
    }
  }
  if (existsSync(DEST)) await rm(DEST, { recursive: true });
  await mkdir(DEST, { recursive: true });
  // Restore manual files
  if (existsSync(manualDir)) {
    const entries = await readdir(manualDir, { withFileTypes: true });
    for (const entry of entries) {
      await cp(join(manualDir, entry.name), join(DEST, entry.name), { recursive: entry.isDirectory() });
    }
    await rm(manualDir, { recursive: true });
  }

  const files = await getAllMdFiles(SOURCE);
  let enCount = 0, koCount = 0;

  for (const { full, rel } of files) {
    const content = await readFile(full, 'utf-8');
    const name = basename(rel);
    const dir = dirname(rel);

    const normalizedRel = rel.toLowerCase();

    // Skip root index.md — we have a custom index.mdx
    if (normalizedRel === 'index.md') continue;
    // Skip internal standalone files
    if (INTERNAL_FILES.has(normalizedRel)) continue;

    if (name.endsWith('.ko.md')) {
      // Korean → ko/ subdirectory, strip .ko
      const enName = name.replace('.ko.md', '.md').toLowerCase();
      const destPath = join(DEST, 'ko', dir.toLowerCase(), enName);
      await mkdir(dirname(destPath), { recursive: true });
      const rewritten = sanitizePublicDocs(rewriteLinks(content, true, rel), rel);
      await writeFile(destPath, addFrontmatter(rewritten, enName.replace('.md', '')));
      koCount++;
    } else {
      // English — lowercase filename
      const destPath = join(DEST, dir.toLowerCase(), name.toLowerCase());
      await mkdir(dirname(destPath), { recursive: true });
      const rewritten = sanitizePublicDocs(rewriteLinks(content, false, rel), rel);
      await writeFile(destPath, addFrontmatter(rewritten, name.replace('.md', '')));
      enCount++;
    }
  }

  // Copy assets
  const assetsDir = join(SOURCE, 'assets');
  if (existsSync(assetsDir)) {
    await cp(assetsDir, join(DEST, '_assets'), { recursive: true });
  }

  console.log(`✓ Synced ${enCount} EN + ${koCount} KO docs → src/content/docs/`);
}

main().catch(console.error);
