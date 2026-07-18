#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { readCsv, slug } from './growth-utils.mjs';

const outputDir = 'public/og';
const manifestPath = 'src/generated/social-previews.json';

const topicThemes = [
  {
    match: /action[- ]outcome|experiment|controlled pilot/i,
    topic: 'Action-Outcome Research',
    accent: '#f472b6',
    second: '#2dd4bf',
    proof: 'Measured evidence from replay and controlled pilots',
  },
  {
    match: /action[- ]outcome memory/i,
    topic: 'Action-Outcome Memory',
    accent: '#2dd4bf',
    second: '#f472b6',
    proof: 'Connect actions, outcomes, and replayable evidence',
  },
  {
    match: /robot|ros|physical-ai|physical ai/i,
    topic: 'Physical AI',
    accent: '#fb7185',
    second: '#38bdf8',
    proof: 'ROS 2 telemetry and action memory',
  },
  {
    match: /vector|rag/i,
    topic: 'Vector DB Alternative',
    accent: '#34d399',
    second: '#818cf8',
    proof: 'Semantic recall tied to time-series evidence',
  },
  {
    match: /kdb|quant|trading/i,
    topic: 'Time-Series Hot Paths',
    accent: '#f97316',
    second: '#06b6d4',
    proof: 'Microsecond evidence recall',
  },
  {
    match: /benchmark|latency|performance/i,
    topic: 'Benchmarks',
    accent: '#eab308',
    second: '#22c55e',
    proof: 'Measure the loop, not only the query',
  },
  {
    match: /clickhouse|influxdb|timescale|database/i,
    topic: 'Database Tradeoffs',
    accent: '#60a5fa',
    second: '#f472b6',
    proof: 'Fresh events, scoped recall, replay',
  },
  {
    match: /prompt-cache|prompt cache|cache/i,
    topic: 'Prompt Cache',
    accent: '#f59e0b',
    second: '#22c55e',
    proof: 'Cache hits stay in the decision timeline',
  },
  {
    match: /agentops|observability|replay/i,
    topic: 'AgentOps Replay',
    accent: '#a78bfa',
    second: '#38bdf8',
    proof: 'Inspect the chain from evidence to action',
  },
  {
    match: /agent-memory|agent memory|\bmemory\b/i,
    topic: 'Agent Memory',
    accent: '#2dd4bf',
    second: '#60a5fa',
    proof: 'Replayable context for live agents',
  },
];

const topicOverrides = {
  '/': 'Action-Outcome Memory',
  '/features/': 'Live Data Infrastructure',
  '/blog/introducing-zeptodb/': 'Live Data Infrastructure',
  '/experiments/': 'Action-Outcome Research',
  '/use-cases/action-outcome-memory/': 'Action-Outcome Research',
  '/blog/physical-ai-action-outcome-memory/': 'Action-Outcome Research',
  '/use-cases/agent-memory/': 'Agent Memory',
  '/blog/what-is-agent-memory/': 'Agent Memory',
  '/compare/vs-kdb/': 'Time-Series Hot Paths',
};

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(
    match[1].split('\n').map((line) => {
      const [key, ...rest] = line.split(':');
      return [key.trim(), rest.join(':').trim().replace(/^"|"$/g, '')];
    }).filter(([key]) => key),
  );
}

function contentPathFor(route) {
  const clean = route.replace(/^\/|\/$/g, '');
  const candidates = clean
    ? [
        `src/content/docs/${clean}.mdx`,
        `src/content/docs/${clean}.md`,
        `src/content/docs/${clean}/index.mdx`,
        `src/content/docs/${clean}/index.md`,
      ]
    : ['src/content/docs/index.mdx', 'src/content/docs/index.md'];
  return candidates.find((candidate) => existsSync(candidate));
}

function routeTitle(route) {
  const path = contentPathFor(route);
  if (path) {
    const meta = frontmatter(readFileSync(path, 'utf8'));
    if (meta.title) return meta.title;
  }
  return route
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'ZeptoDB';
}

function routeDescription(route) {
  const path = contentPathFor(route);
  if (!path) return '';
  const meta = frontmatter(readFileSync(path, 'utf8'));
  return meta.description || '';
}

function themeFor(route, title, description) {
  if (topicOverrides[route]) {
    return topicThemes.find((theme) => theme.topic === topicOverrides[route]) || {
      topic: topicOverrides[route],
      accent: '#2dd4bf',
      second: '#f472b6',
      proof: 'Time-series evidence for operational AI',
    };
  }
  const haystack = `${route} ${title} ${description}`;
  return topicThemes.find((theme) => theme.match.test(haystack)) || {
    topic: 'Live Data Infrastructure',
    accent: '#2dd4bf',
    second: '#f472b6',
    proof: 'Time-series evidence for operational AI',
  };
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapWords(value, limit, maxLines) {
  const words = String(value).replace(/\s+/g, ' ').trim().split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.join(' ').length > lines.join(' ').length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\s+\S*$/, '')}...`;
  }
  return lines;
}

function socialSvg({ route, title, description, theme }) {
  const titleLines = wrapWords(title, 24, 3);
  const descLines = wrapWords(description || theme.proof, 62, 2);
  const routeLabel = route === '/' ? 'zeptodb.com' : `zeptodb.com${route}`;
  const chipX = 78;
  const chipY = 54;
  const titleY = 208;
  const descY = 450;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#08111f"/>
      <stop offset="0.52" stop-color="#101827"/>
      <stop offset="1" stop-color="#171321"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${theme.accent}"/>
      <stop offset="1" stop-color="${theme.second}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <path d="M620 570 C840 566 1010 438 1170 184" fill="none" stroke="${theme.accent}" stroke-width="5" opacity="0.48"/>
  <path d="M560 618 C786 584 930 560 1070 452" fill="none" stroke="${theme.second}" stroke-width="4" opacity="0.34"/>
  <g transform="translate(858 116)" opacity="0.82" filter="url(#shadow)">
    <rect x="0" y="0" width="270" height="286" rx="18" fill="#0c1424" stroke="#26344a"/>
    <path d="M36 60 H206 M36 108 H190 M36 156 H226 M36 204 H160" stroke="url(#accent)" stroke-width="9" stroke-linecap="round"/>
    <circle cx="206" cy="60" r="16" fill="${theme.accent}"/>
    <circle cx="190" cy="108" r="16" fill="${theme.second}"/>
    <circle cx="226" cy="156" r="16" fill="${theme.accent}"/>
    <circle cx="160" cy="204" r="16" fill="${theme.second}"/>
  </g>
  <rect x="${chipX}" y="${chipY}" width="310" height="46" rx="23" fill="#121c2d" stroke="#2b3a53"/>
  <circle cx="${chipX + 28}" cy="${chipY + 23}" r="7" fill="${theme.accent}"/>
  <text x="${chipX + 48}" y="${chipY + 30}" fill="#d7e3f5" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700">${escapeXml(theme.topic)}</text>
  <text x="78" y="164" fill="#7dd3fc" font-size="22" font-family="Inter, Arial, sans-serif" font-weight="700" letter-spacing="2">ZEPTO DB</text>
  ${titleLines.map((line, index) => `<text x="78" y="${titleY + index * 68}" fill="#f8fafc" font-size="62" font-family="Inter, Arial, sans-serif" font-weight="800">${escapeXml(line)}</text>`).join('\n  ')}
  ${descLines.map((line, index) => `<text x="82" y="${descY + index * 36}" fill="#cbd5e1" font-size="28" font-family="Inter, Arial, sans-serif">${escapeXml(line)}</text>`).join('\n  ')}
  <rect x="78" y="552" width="548" height="2" fill="url(#accent)"/>
  <text x="78" y="598" fill="#94a3b8" font-size="25" font-family="Inter, Arial, sans-serif">${escapeXml(routeLabel)}</text>
</svg>`;
}

async function tryRenderPng(svgPath, pngPath) {
  try {
    const { default: sharp } = await import('sharp');
    await sharp(svgPath).png().toFile(pngPath);
    return existsSync(pngPath);
  } catch {
    // Fall back to local macOS renderers below.
  }

  const tmpDir = join('/tmp', 'zeptodb-og-render');
  mkdirSync(tmpDir, { recursive: true });

  try {
    execFileSync('/usr/bin/qlmanage', ['-t', '-s', '1200', '-o', tmpDir, svgPath], {
      stdio: 'ignore',
    });
    const quickLookPath = join(tmpDir, `${basename(svgPath)}.png`);
    if (existsSync(quickLookPath)) {
      copyFileSync(quickLookPath, pngPath);
      return true;
    }
  } catch {
    // Keep SVG output when local rasterization is unavailable.
  }

  try {
    execFileSync('/usr/bin/sips', ['-s', 'format', 'png', svgPath, '--out', pngPath], {
      stdio: 'ignore',
    });
    return existsSync(pngPath);
  } catch {
    return false;
  }
}

function uniqueRoutes() {
  const routes = new Set(['/']);

  function addContentRoutes(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        addContentRoutes(fullPath);
        continue;
      }
      if (!/\.mdx?$/.test(entry.name)) continue;

      let route = relative('src/content/docs', fullPath)
        .split(sep)
        .join('/')
        .replace(/\.mdx?$/, '')
        .replace(/(^|\/)index$/, '');
      route = route ? `/${route.replace(/^\/+|\/+$/g, '')}/` : '/';
      routes.add(route);
    }
  }

  addContentRoutes('src/content/docs');
  if (existsSync('growth/campaign-links.csv')) {
    for (const record of readCsv('growth/campaign-links.csv').records) {
      if (record.path) routes.add(record.path.endsWith('/') ? record.path : `${record.path}/`);
    }
  }
  for (const route of [
    '/blog/agent-memory-benchmarks/',
    '/blog/what-is-agent-memory/',
    '/blog/best-database-for-ai-agents-live-data/',
    '/blog/physical-ai-action-outcome-memory/',
    '/experiments/',
    '/use-cases/agent-memory/',
    '/use-cases/agent-memory-python-quickstart/',
    '/use-cases/action-outcome-memory/',
    '/use-cases/robotics/',
    '/compare/agent-memory-vs-vector-databases/',
    '/compare/vs-kdb/',
    '/features/',
    '/benchmarks/',
  ]) {
    routes.add(route);
  }
  return [...routes].sort();
}

async function main() {
  rmSync(outputDir, { recursive: true, force: true });
  mkdirSync(outputDir, { recursive: true });
  mkdirSync(dirname(manifestPath), { recursive: true });

  const manifest = {};
  for (const route of uniqueRoutes()) {
    const title = routeTitle(route);
    const description = routeDescription(route);
    const theme = themeFor(route, title, description);
    const baseName = slug(route === '/' ? 'home' : route.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
    const svgFilename = `${baseName}.svg`;
    const pngFilename = `${baseName}.png`;
    const svgPath = join(outputDir, svgFilename);
    const pngPath = join(outputDir, pngFilename);
    const svg = socialSvg({ route, title, description, theme });
    writeFileSync(svgPath, svg);
    const hasPng = await tryRenderPng(svgPath, pngPath);
    if (hasPng) rmSync(svgPath, { force: true });
    manifest[route] = {
      image: hasPng ? `/og/${pngFilename}` : `/og/${svgFilename}`,
      alt: `ZeptoDB ${theme.topic}: ${title}`,
      topic: theme.topic,
      width: 1200,
      height: 630,
    };
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Generated ${Object.keys(manifest).length} social preview image(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
