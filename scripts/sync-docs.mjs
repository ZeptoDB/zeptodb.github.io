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
import { join, relative, basename, dirname } from 'node:path';
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

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function extractDescription(body) {
  // Find first non-empty line that isn't a heading, frontmatter, or markdown syntax
  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('|') || trimmed.startsWith('```') || trimmed.startsWith('---') || trimmed.startsWith('- [')) continue;
    // Strip markdown formatting
    const clean = trimmed.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_`]/g, '').trim();
    if (clean.length >= 20) return clean.length > 160 ? clean.slice(0, 157) + '...' : clean;
  }
  return '';
}

function addFrontmatter(content, fallbackTitle) {
  if (content.startsWith('---')) return content;
  const title = extractTitle(content) || fallbackTitle;
  // Remove the first # heading that matches the title to avoid duplication
  const body = content.replace(/^#\s+.+\n*/m, '');
  // Auto-generate description from first non-empty paragraph
  const desc = extractDescription(body);
  const descLine = desc ? `\ndescription: "${desc.replace(/"/g, '\\"')}"` : '';
  return `---\ntitle: "${title.replace(/"/g, '\\"')}"${descLine}\n---\n\n${body}`;
}

/**
 * Rewrite markdown internal links from source-repo style (.md references)
 * to Starlight-compatible slug paths.
 *
 * Handles: UPPER.md, path/UPPER.md, ../path/UPPER.md, UPPER_ko.md, #anchors
 */
function rewriteLinks(content, isKorean) {
  return content.replace(
    /\]\(([^)]*\.md(?:#[^)]*)?)\)/g,
    (match, rawHref) => {
      // Split anchor
      const [pathPart, anchor] = rawHref.split('#');
      const anchorSuffix = anchor ? `#${anchor}` : '';

      // Strip leading docs/ prefix (some files use docs/design/foo.md)
      let p = pathPart.replace(/^docs\//, '/');

      // Handle _ko.md suffix — strip it (Korean files live under ko/ already)
      const isKoLink = p.endsWith('_ko.md');
      if (isKoLink) {
        p = p.replace(/_ko\.md$/, '.md');
      }

      // Lowercase and strip .md extension, add trailing slash
      p = p.replace(/\.md$/, '').replace(/[A-Z]/g, c => c.toLowerCase()) + '/';

      // If the link targets a Korean doc but we're in English content, prefix with /ko
      if (isKoLink && !isKorean) {
        // Make absolute: /ko/<resolved path>
        p = p.startsWith('/') ? `/ko${p}` : `/ko/${p}`;
      }

      return `](${p}${anchorSuffix})`;
    }
  );
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
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }

  // Clean dest (preserve manually managed files)
  // We re-create from scratch each time, but restore manual files after
  const manualDir = join(import.meta.dirname, '..', 'src', 'content', 'docs-manual');
  // Save manual files
  const manualEntries = [
    'index.mdx', 'features.mdx', 'pricing.mdx', 'integrations.mdx',
    'security.mdx', 'community.mdx', 'about.mdx', 'contact.md',
  ];
  const manualDirs = ['use-cases', 'compare', 'benchmarks', 'blog'];
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

    // Skip root index.md — we have a custom index.mdx
    if (rel === 'index.md') continue;
    // Skip internal standalone files
    if (INTERNAL_FILES.has(rel)) continue;

    if (name.endsWith('.ko.md')) {
      // Korean → ko/ subdirectory, strip .ko
      const enName = name.replace('.ko.md', '.md').toLowerCase();
      const destPath = join(DEST, 'ko', dir.toLowerCase(), enName);
      await mkdir(dirname(destPath), { recursive: true });
      const rewritten = rewriteLinks(content, true);
      await writeFile(destPath, addFrontmatter(rewritten, enName.replace('.md', '')));
      koCount++;
    } else {
      // English — lowercase filename
      const destPath = join(DEST, dir.toLowerCase(), name.toLowerCase());
      await mkdir(dirname(destPath), { recursive: true });
      const rewritten = rewriteLinks(content, false);
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
