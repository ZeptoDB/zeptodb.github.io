#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

const ROOT = join(import.meta.dirname, '..');
const DIST = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(ROOT, 'dist');
const ORIGIN = 'https://zeptodb.com';
const MIN_UPSTREAM_DOCUMENTS = 80;
const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'robots.txt',
  'llms.txt',
  'ai-index.json',
  'docs-sync.json',
  'sitemap-index.xml',
  'favicon.svg',
];
const REQUIRED_ROUTES = [
  '/',
  '/docs/',
  '/getting-started/quick_start/',
  '/api/http_reference/',
  '/api/python_reference/',
  '/experiments/',
];
const FORBIDDEN_ROUTES = [
  '/backlog/',
  '/completed/',
  '/feeds/feed_handler_complete/',
  '/feeds/feed_handler_guide/',
  '/feeds/performance_optimization/',
  '/usecases/physical_ai/',
];

const errors = [];
const warnings = [];

function toPosix(path) {
  return path.split(sep).join('/');
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

function routeForHtml(rel) {
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404.html';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match ? decodeHtml(match[1] ?? match[2] ?? '') : null;
}

function normalizePathname(pathname) {
  try {
    return decodeURIComponent(pathname).replace(/\/{2,}/g, '/');
  } catch {
    return pathname.replace(/\/{2,}/g, '/');
  }
}

function findTargetFile(pathname, fileSet, routeToFile) {
  const normalized = normalizePathname(pathname);
  const direct = normalized.replace(/^\//, '');
  if (fileSet.has(direct)) return direct;
  if (routeToFile.has(normalized)) return routeToFile.get(normalized);
  if (!normalized.endsWith('/') && routeToFile.has(`${normalized}/`)) {
    return routeToFile.get(`${normalized}/`);
  }
  return null;
}

function collectReferences(html) {
  const refs = [];
  for (const match of html.matchAll(/\b(href|src)=(?:"([^"]*)"|'([^']*)')/gi)) {
    refs.push({ attribute: match[1].toLowerCase(), value: decodeHtml(match[2] ?? match[3] ?? '') });
  }
  for (const match of html.matchAll(/\bsrcset=(?:"([^"]*)"|'([^']*)')/gi)) {
    const srcset = decodeHtml(match[1] ?? match[2] ?? '');
    for (const candidate of srcset.split(',')) {
      const value = candidate.trim().split(/\s+/)[0];
      if (value) refs.push({ attribute: 'srcset', value });
    }
  }
  return refs;
}

function addIssue(list, rel, message) {
  list.push(`${rel}: ${message}`);
}

async function main() {
  if (!existsSync(DIST)) {
    console.error(`QA target not found: ${DIST}`);
    console.error('Run `pnpm build` first.');
    process.exit(1);
  }

  const files = await walk(DIST);
  const relFiles = files.map((file) => toPosix(relative(DIST, file)));
  const fileSet = new Set(relFiles);
  const htmlFiles = relFiles.filter((file) => file.endsWith('.html'));
  const routeToFile = new Map();

  for (const rel of htmlFiles) {
    const route = routeForHtml(rel);
    routeToFile.set(route, rel);
    if (route.endsWith('/') && route !== '/') routeToFile.set(route.slice(0, -1), rel);
  }
  if (fileSet.has('404.html')) routeToFile.set('/404/', '404.html');

  for (const required of REQUIRED_FILES) {
    if (!fileSet.has(required)) addIssue(errors, required, 'required build output is missing');
  }
  for (const route of REQUIRED_ROUTES) {
    if (!routeToFile.has(route)) addIssue(errors, route, 'required upstream-backed route is missing');
  }
  for (const route of FORBIDDEN_ROUTES) {
    if (routeToFile.has(route)) addIssue(errors, route, 'internal project document must not be published');
  }
  if (htmlFiles.length < 20) {
    addIssue(errors, '.', `only ${htmlFiles.length} HTML pages were built; expected at least 20`);
  }

  if (fileSet.has('docs-sync.json')) {
    try {
      const manifest = JSON.parse(await readFile(join(DIST, 'docs-sync.json'), 'utf8'));
      if (manifest.schemaVersion !== 2) {
        addIssue(errors, 'docs-sync.json', `unsupported schema version: ${manifest.schemaVersion}`);
      }
      if (!Number.isInteger(manifest.totalDocuments) || manifest.totalDocuments < MIN_UPSTREAM_DOCUMENTS) {
        addIssue(errors, 'docs-sync.json', `invalid upstream document count: ${manifest.totalDocuments}`);
      }
      if (!/^[0-9a-f]{40}$/i.test(manifest.sourceSha ?? '')) {
        addIssue(errors, 'docs-sync.json', `invalid source SHA: ${manifest.sourceSha}`);
      }
      if (!/^[0-9a-f]{40}$/i.test(manifest.siteSha ?? '')) {
        addIssue(errors, 'docs-sync.json', `invalid site SHA: ${manifest.siteSha}`);
      }
      if (manifest.sourceDirty) {
        addIssue(process.env.CI === 'true' ? errors : warnings, 'docs-sync.json', 'ZeptoDB docs had uncommitted changes');
      }
      if (manifest.siteDirty) {
        addIssue(process.env.CI === 'true' ? errors : warnings, 'docs-sync.json', 'site had uncommitted changes');
      }

      if (!Array.isArray(manifest.documents) || manifest.documents.length !== manifest.totalDocuments) {
        addIssue(errors, 'docs-sync.json', 'document inventory length does not match totalDocuments');
      } else {
        const sources = new Set();
        const destinations = new Set();
        for (const document of manifest.documents) {
          if (!document?.source || sources.has(document.source)) addIssue(errors, 'docs-sync.json', `duplicate or missing inventory source: ${document?.source}`);
          if (!document?.destination || destinations.has(document.destination)) addIssue(errors, 'docs-sync.json', `duplicate or missing inventory destination: ${document?.destination}`);
          if (!/^[0-9a-f]{64}$/i.test(document?.sha256 ?? '')) addIssue(errors, 'docs-sync.json', `invalid inventory hash for ${document?.source}`);
          if (document?.destination) {
            const inventoryRoute = `/${document.destination.replace(/\.md$/i, '').replace(/\/index$/i, '')}/`.replace(/\/{2,}/g, '/');
            if (!routeToFile.has(inventoryRoute)) addIssue(errors, 'docs-sync.json', `inventory destination has no rendered route: ${document.destination}`);
            const generatedPath = join(ROOT, 'src', 'content', 'docs', document.destination);
            if (!existsSync(generatedPath)) {
              addIssue(errors, 'docs-sync.json', `inventory destination is missing from generated docs: ${document.destination}`);
            } else {
              const generatedHash = createHash('sha256').update(await readFile(generatedPath)).digest('hex');
              if (generatedHash !== document.sha256) addIssue(errors, 'docs-sync.json', `inventory hash mismatch: ${document.destination}`);
            }
          }
          sources.add(document?.source);
          destinations.add(document?.destination);
        }
      }
    } catch (error) {
      addIssue(errors, 'docs-sync.json', `invalid sync manifest: ${error.message}`);
    }
  }

  const idsByFile = new Map();
  const htmlByFile = new Map();
  for (const rel of htmlFiles) {
    const html = await readFile(join(DIST, rel), 'utf8');
    htmlByFile.set(rel, html);
    idsByFile.set(rel, new Set([...html.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/gi)].map((m) => decodeHtml(m[1] ?? m[2]))));
  }

  const canonicalOwners = new Map();
  const titleOwners = new Map();
  const descriptionOwners = new Map();
  const shouldIndexByCanonical = new Map();
  let shortDescriptions = 0;
  let redirectCount = 0;

  for (const rel of htmlFiles) {
    const html = htmlByFile.get(rel);
    const route = routeForHtml(rel);
    const pageUrl = new URL(route, ORIGIN);
    const is404 = rel === '404.html';

    const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
    const refreshTag = metaTags.find((tag) => getAttribute(tag, 'http-equiv')?.toLowerCase() === 'refresh');
    if (refreshTag) {
      const refresh = getAttribute(refreshTag, 'content') ?? '';
      const destination = refresh.match(/^0\s*;\s*url=(.+)$/i)?.[1]?.trim();
      const canonicalTag = (html.match(/<link\b[^>]*>/gi) ?? [])
        .find((tag) => getAttribute(tag, 'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
      const canonical = canonicalTag ? getAttribute(canonicalTag, 'href') : null;
      const robotsTag = metaTags.find((tag) => getAttribute(tag, 'name')?.toLowerCase() === 'robots');
      const robots = robotsTag ? getAttribute(robotsTag, 'content')?.toLowerCase() : '';

      if (!destination) {
        addIssue(errors, rel, 'redirect has an invalid meta refresh target');
      } else {
        const destinationUrl = new URL(destination, pageUrl);
        if (destinationUrl.origin !== ORIGIN) {
          addIssue(errors, rel, `redirect leaves the canonical site origin: ${destination}`);
        } else if (!findTargetFile(destinationUrl.pathname, fileSet, routeToFile)) {
          addIssue(errors, rel, `redirect target does not exist: ${destination}`);
        }
        if (canonical !== destinationUrl.href) {
          addIssue(errors, rel, `redirect canonical is ${canonical}; expected ${destinationUrl.href}`);
        }
      }
      if (!robots?.split(/\s*,\s*/).includes('noindex')) {
        addIssue(errors, rel, 'redirect is missing robots noindex');
      }
      redirectCount++;
      continue;
    }

    if (/^\/research\/[^/]*_experiment_\d{3}\/$/i.test(route)) {
      addIssue(errors, rel, 'experiment specification is public under /research; add a reviewed canonical mapping in experiment-routes.mjs');
    }

    if (/<p>\s*\|[^\n]*\|\r?\n\s*\|(?:\s*:?-{3,}:?\s*\|){2,}/i.test(html)) {
      addIssue(errors, rel, 'Markdown table syntax was rendered as paragraph text');
    }

    const htmlTag = html.match(/<html\b[^>]*>/i)?.[0];
    if (!htmlTag || !getAttribute(htmlTag, 'lang')) addIssue(errors, rel, 'missing <html lang>');

    const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');
    if (!title) addIssue(errors, rel, 'missing non-empty <title>');
    else if (!is404 && titleOwners.has(title)) addIssue(errors, rel, `title duplicates ${titleOwners.get(title)}`);
    else if (!is404) titleOwners.set(title, rel);

    const mainCount = (html.match(/<main\b/gi) ?? []).length;
    if (mainCount !== 1) addIssue(errors, rel, `expected one <main>, found ${mainCount}`);

    const h1Count = (html.match(/<h1\b/gi) ?? []).length;
    if (!is404 && h1Count !== 1) addIssue(errors, rel, `expected one <h1>, found ${h1Count}`);

    const descriptionTag = metaTags.find((tag) => getAttribute(tag, 'name')?.toLowerCase() === 'description');
    const description = descriptionTag ? getAttribute(descriptionTag, 'content')?.trim() : '';
    if (!is404 && !description) addIssue(errors, rel, 'missing meta description');
    else if (!is404 && description.length < 50) shortDescriptions++;
    else if (description.length > 170) addIssue(warnings, rel, `meta description is ${description.length} characters`);
    if (!is404 && description) {
      if (descriptionOwners.has(description)) addIssue(errors, rel, `meta description duplicates ${descriptionOwners.get(description)}`);
      else descriptionOwners.set(description, rel);
    }

    const canonicalTags = (html.match(/<link\b[^>]*>/gi) ?? [])
      .filter((tag) => getAttribute(tag, 'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
    if (!is404 && canonicalTags.length !== 1) {
      addIssue(errors, rel, `expected one canonical link, found ${canonicalTags.length}`);
    } else if (!is404) {
      const canonical = getAttribute(canonicalTags[0], 'href');
      if (canonical !== pageUrl.href) addIssue(errors, rel, `canonical is ${canonical}; expected ${pageUrl.href}`);
      if (canonicalOwners.has(canonical)) addIssue(errors, rel, `canonical duplicates ${canonicalOwners.get(canonical)}`);
      else canonicalOwners.set(canonical, rel);
      const robotsTag = metaTags.find((tag) => getAttribute(tag, 'name')?.toLowerCase() === 'robots');
      const robots = robotsTag ? getAttribute(robotsTag, 'content')?.toLowerCase() ?? '' : '';
      shouldIndexByCanonical.set(canonical, !robots.split(/\s*,\s*/).includes('noindex'));
    }

    const structuredTypes = new Set();
    let structuredDatePublished = false;
    let structuredBlockCount = 0;
    for (const script of html.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi)) {
      try {
        const structuredData = JSON.parse(script[1]);
        const nodes = Array.isArray(structuredData)
          ? structuredData
          : Array.isArray(structuredData?.['@graph'])
            ? structuredData['@graph']
            : [structuredData];
        for (const node of nodes) {
          const types = Array.isArray(node?.['@type']) ? node['@type'] : [node?.['@type']];
          for (const type of types.filter(Boolean)) structuredTypes.add(type);
          if (node?.datePublished) structuredDatePublished = true;
        }
        structuredBlockCount++;
      } catch (error) {
        addIssue(errors, rel, `invalid JSON-LD: ${error.message}`);
      }
    }
    if (!is404 && structuredBlockCount === 0) addIssue(errors, rel, 'missing JSON-LD');
    if (route === '/experiments/' && !structuredTypes.has('CollectionPage')) {
      addIssue(errors, rel, 'experiment index JSON-LD must include CollectionPage');
    }
    if (/^\/experiments\/[^/]+\/$/.test(route)) {
      if (!structuredTypes.has('TechArticle')) addIssue(errors, rel, 'experiment JSON-LD must include TechArticle');
      if (!structuredDatePublished) addIssue(errors, rel, 'experiment JSON-LD is missing datePublished');
    }

    for (const imageTag of html.match(/<img\b[^>]*>/gi) ?? []) {
      if (!/\balt(?:\s|=|\/?>)/i.test(imageTag)) addIssue(errors, rel, 'image is missing alt attribute');
    }

    for (const anchorTag of html.match(/<a\b[^>]*>/gi) ?? []) {
      if (getAttribute(anchorTag, 'target') !== '_blank') continue;
      const relValue = getAttribute(anchorTag, 'rel')?.toLowerCase().split(/\s+/) ?? [];
      if (!relValue.includes('noopener')) addIssue(errors, rel, 'target="_blank" link is missing rel="noopener"');
    }

    for (const { attribute, value } of collectReferences(html)) {
      if (!value || value === '#' || value.startsWith('data:') || value.startsWith('javascript:')) continue;

      let targetUrl;
      try {
        targetUrl = new URL(value, pageUrl);
      } catch {
        addIssue(errors, rel, `${attribute} has invalid URL: ${value}`);
        continue;
      }
      if (!['http:', 'https:'].includes(targetUrl.protocol) || targetUrl.origin !== ORIGIN) continue;

      const targetFile = findTargetFile(targetUrl.pathname, fileSet, routeToFile);
      if (!targetFile) {
        addIssue(errors, rel, `broken local ${attribute}: ${value}`);
        continue;
      }

      if (targetUrl.hash && targetFile.endsWith('.html')) {
        let fragment;
        try {
          fragment = decodeURIComponent(targetUrl.hash.slice(1));
        } catch {
          fragment = targetUrl.hash.slice(1);
        }
        if (fragment && !idsByFile.get(targetFile)?.has(fragment)) {
          addIssue(errors, rel, `missing fragment ${targetUrl.hash} in ${targetFile}`);
        }
      }
    }
  }

  if (shortDescriptions > 0) {
    warnings.push(`${shortDescriptions} page(s) have meta descriptions shorter than 50 characters`);
  }

  const sitemapUrls = new Set();
  for (const rel of relFiles.filter((file) => /^sitemap-\d+\.xml$/.test(file))) {
    const xml = await readFile(join(DIST, rel), 'utf8');
    for (const match of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
      sitemapUrls.add(decodeHtml(match[1].trim()));
    }
  }
  if (!sitemapUrls.size) {
    addIssue(errors, 'sitemap-index.xml', 'no page URLs were found in generated sitemap files');
  }
  for (const [canonical, rel] of canonicalOwners) {
    const shouldIndex = shouldIndexByCanonical.get(canonical) !== false;
    if (shouldIndex && !sitemapUrls.has(canonical)) addIssue(errors, rel, 'indexable canonical is missing from the sitemap');
    if (!shouldIndex && sitemapUrls.has(canonical)) addIssue(errors, rel, 'noindex canonical is present in the sitemap');
  }
  for (const sitemapUrl of sitemapUrls) {
    let parsed;
    try {
      parsed = new URL(sitemapUrl);
    } catch {
      addIssue(errors, 'sitemap', `invalid URL: ${sitemapUrl}`);
      continue;
    }
    if (parsed.origin === ORIGIN && !findTargetFile(parsed.pathname, fileSet, routeToFile)) {
      addIssue(errors, 'sitemap', `URL has no rendered page: ${sitemapUrl}`);
    }
  }

  console.log(`Checked ${htmlFiles.length - redirectCount} pages, ${redirectCount} redirects, and ${relFiles.length} build files in ${DIST}`);
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const warning of warnings) console.log(`  - ${warning}`);
  }
  if (errors.length) {
    console.error(`\nErrors (${errors.length}):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log('\nSite QA passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
