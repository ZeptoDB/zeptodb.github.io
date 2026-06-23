#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import { buildUtmUrl, csvEscape, getArg, readCsv, slug } from './growth-utils.mjs';

const runDate = getArg('date', new Date().toISOString().slice(0, 10));
const commentTarget = Math.max(1, Math.min(5, Number(getArg('comments', 3))));
const phase = getArg('phase', 'reputation');
const outputPath = getArg('output', '');

const phaseDefaults = {
  reputation: 0,
  soft: 1,
  direct: 1,
};

const promoMax = Math.max(
  0,
  Math.min(commentTarget, Number(getArg('promo-max', phaseDefaults[phase] ?? 0))),
);

const communityCategories = new Set(['AI agents', 'ML platform', 'Observability', 'Data infrastructure']);
const keywordClusters = new Set(['agent_memory', 'agentops', 'vector_db']);

const communityWeight = {
  'AI agents': 5,
  'ML platform': 4,
  Observability: 4,
  'Data infrastructure': 3,
};

const audienceWeight = {
  high: 5,
  medium: 3,
  low: 1,
};

const riskWeight = {
  low: 1,
  medium: 2,
  high: 3,
};

const angles = [
  {
    name: 'memory architecture',
    trigger: 'Use when the thread asks how to store or retrieve agent memory.',
    draft:
      'I would separate "memory" into at least three layers: facts the agent can retrieve, an event log of what the agent saw and did, and an outcome record for later replay. Embeddings help with retrieval, but they do not replace the timeline. The timeline is what lets you answer: which context was retrieved, which tool was called, and what happened afterward.',
  },
  {
    name: 'operational replay',
    trigger: 'Use when the thread discusses debugging, observability, evals, or AgentOps.',
    draft:
      'The debugging question I would design around is: can you replay the agent decision from evidence, not just from a final chat transcript? For production agents I would keep tool calls, memory retrievals, prompt/cache events, model responses, actions, and outcomes on one timeline. That makes weird behavior much easier to inspect later.',
  },
  {
    name: 'vector store boundary',
    trigger: 'Use when the thread treats vector DBs as the whole memory layer.',
    draft:
      'Vector search is useful, but I would not make it the entire memory system. It answers "what is semantically similar?" Better agent memory also needs recency, tenant/session scope, TTL, provenance, and sometimes temporal joins against live events. The storage choice depends on whether the memory is just notes or part of a live decision loop.',
  },
  {
    name: 'context hygiene',
    trigger: 'Use when the thread asks about long-term memory quality or hallucinated memories.',
    draft:
      'A practical pattern is to treat memory writes as events that need policy, scope, and expiry. Not every conversation detail should become durable memory. I would store why the memory was written, who/what it applies to, when it expires, and which later answer used it. That audit path matters more as agents start taking actions.',
  },
  {
    name: 'prompt cache plus memory',
    trigger: 'Use when the thread mentions cost, repeated prompts, or repeated agent tasks.',
    draft:
      'For repeated agent tasks, I would put cache and memory in the same observability path: exact cache hit, semantic cache hit, live evidence lookup, durable memory retrieval, model call, then write-back. The cost win is nice, but the bigger benefit is being able to inspect why a cached or remembered answer was reused.',
  },
];

function dateSeed(date) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(timestamp)) throw new Error(`Invalid date: ${date}`);
  return Math.floor(timestamp / 86_400_000);
}

function redditSearchUrl(community, keyword) {
  const subreddit = community.replace(/^r\//, '');
  const url = new URL(`https://www.reddit.com/r/${subreddit}/search/`);
  url.searchParams.set('q', keyword);
  url.searchParams.set('restrict_sr', '1');
  url.searchParams.set('sort', 'new');
  return url.href;
}

function subredditNewUrl(community) {
  const subreddit = community.replace(/^r\//, '');
  return `https://www.reddit.com/r/${subreddit}/new/`;
}

function globalSearchUrl(keyword) {
  const url = new URL('https://www.reddit.com/search/');
  url.searchParams.set('q', keyword);
  url.searchParams.set('sort', 'new');
  return url.href;
}

function scoreCommunity(record) {
  return (communityWeight[record.category] || 0) + (audienceWeight[record.audience_fit] || 0) - (riskWeight[record.risk] || 0);
}

function rotate(items, seed) {
  if (items.length === 0) return [];
  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

function buildProductMention(slot, utmUrl) {
  return [
    'Only use this if the thread explicitly asks for tools, databases, or implementation options and the subreddit rules allow a vendor mention.',
    '',
    '```text',
    `${slot.defaultDraft}`,
    '',
    'Disclosure: I work on ZeptoDB, so I am biased. The reason we care about this shape is that agent memory, prompt/cache events, and time-series evidence often need to be replayed together in production systems.',
    '',
    `Relevant page if useful: ${utmUrl}`,
    '```',
  ].join('\n');
}

const seed = dateSeed(runDate);
const communities = readCsv('growth/community-watchlist.csv').records
  .filter((record) => record.channel === 'reddit')
  .filter((record) => record.posture === 'comment_only')
  .filter((record) => communityCategories.has(record.category))
  .map((record) => ({ ...record, score: scoreCommunity(record) }))
  .sort((a, b) => b.score - a.score || a.community.localeCompare(b.community));

const keywords = readCsv('growth/keyword-bank.csv').records
  .filter((record) => keywordClusters.has(record.cluster))
  .filter((record) => Number(record.priority) <= 2)
  .sort((a, b) => Number(a.priority) - Number(b.priority) || a.keyword.localeCompare(b.keyword));

if (communities.length === 0) throw new Error('No eligible Reddit communities found.');
if (keywords.length === 0) throw new Error('No eligible agent-memory keywords found.');

const rotatedCommunities = rotate(communities, seed);
const rotatedKeywords = rotate(keywords, seed * 3);

const slots = Array.from({ length: commentTarget }, (_, index) => {
  const community = rotatedCommunities[(index * 2) % rotatedCommunities.length];
  const keyword = rotatedKeywords[(index * 5) % rotatedKeywords.length];
  const angle = angles[(seed + index) % angles.length];
  const subreddit = community.community.replace(/^r\//, '');
  const utmUrl = buildUtmUrl(keyword.landing_page, {
    source: 'reddit',
    medium: 'comment',
    campaign: '2026-06-agent-memory',
    content: `${slug(subreddit)}-${slug(keyword.cluster)}-${runDate}`,
    term: keyword.keyword,
  });

  return {
    index: index + 1,
    community,
    keyword,
    angle,
    searchUrl: redditSearchUrl(community.community, keyword.keyword),
    newUrl: subredditNewUrl(community.community),
    globalUrl: globalSearchUrl(keyword.keyword),
    utmUrl,
    defaultDraft: angle.draft,
  };
});

const lines = [];
lines.push(`# Daily Reddit Agent Memory Queue - ${runDate}`);
lines.push('');
lines.push('Purpose: build durable reputation in AI-agent-memory discussions by leaving a few genuinely useful comments each day.');
lines.push('');
lines.push('## Daily Limits');
lines.push('');
lines.push(`- Target comments: ${commentTarget}`);
lines.push(`- Phase: ${phase}`);
lines.push(`- ZeptoDB mentions allowed today: ${promoMax}`);
lines.push('- Default posture: no link, no product mention, answer the actual question.');
lines.push('- Never auto-post. The owner opens Reddit, adapts the draft, checks rules, and clicks publish.');
lines.push('');
lines.push('## Approval Checklist');
lines.push('');
lines.push('- [ ] The thread is recent and has a real question or technical discussion.');
lines.push('- [ ] The comment is rewritten for the thread, not pasted verbatim.');
lines.push('- [ ] The comment is useful without a ZeptoDB mention.');
lines.push('- [ ] Subreddit rules allow the reply shape.');
lines.push('- [ ] Affiliation is disclosed if ZeptoDB is mentioned.');
lines.push('- [ ] One link maximum, only when the thread asks for tools or references.');
lines.push('- [ ] No benchmark, legal, security, or licensing claim unless it links to canonical docs.');
lines.push('');
lines.push('## Candidate Searches');
lines.push('');
lines.push('| Slot | Community | Keyword | Angle | Search | New Posts |');
lines.push('| --- | --- | --- | --- | --- | --- |');
for (const slot of slots) {
  lines.push(
    `| ${slot.index} | ${slot.community.community} | ${slot.keyword.keyword} | ${slot.angle.name} | [search](${slot.searchUrl}) | [new](${slot.newUrl}) |`,
  );
}
lines.push('');
lines.push('## Drafts');
for (const slot of slots) {
  lines.push('');
  lines.push(`### ${slot.index}. ${slot.community.community} - ${slot.keyword.keyword}`);
  lines.push('');
  lines.push(`Trigger: ${slot.angle.trigger}`);
  lines.push('');
  lines.push('Default no-product draft:');
  lines.push('');
  lines.push('```text');
  lines.push(slot.defaultDraft);
  lines.push('```');
  lines.push('');
  lines.push(`Fallback global search: ${slot.globalUrl}`);

  if (slot.index <= promoMax) {
    lines.push('');
    lines.push('Optional disclosed product variant:');
    lines.push('');
    lines.push(buildProductMention(slot, slot.utmUrl));
  }
}
lines.push('');
lines.push('## Log Rows After Publishing');
lines.push('');
lines.push('Replace `SOURCE_URL` and outcome fields after posting.');
lines.push('');
lines.push('```csv');
for (const slot of slots) {
  const row = [
    runDate,
    'queued',
    'reddit',
    slot.community.community,
    'SOURCE_URL',
    slot.keyword.keyword,
    slot.keyword.cluster,
    Math.min(5, 3 + Math.max(0, Number(slot.keyword.priority) === 1 ? 2 : 1)),
    slot.community.risk === 'high' ? 3 : 2,
    'comment_only',
    slot.keyword.landing_page,
    slot.utmUrl,
    'manual_review',
    '',
    `Daily Reddit queue slot ${slot.index}; angle=${slot.angle.name}`,
  ];
  lines.push(row.map(csvEscape).join(','));
}
lines.push('```');
lines.push('');
lines.push('## Reputation Notes');
lines.push('');
lines.push('- First two weeks: prefer zero ZeptoDB mentions. Win trust with architecture comments.');
lines.push('- After that: mention ZeptoDB only when someone asks for implementation options.');
lines.push('- Keep the ratio near 5 helpful non-promotional comments for every 1 disclosed product mention.');
lines.push('- If a community reacts negatively, stop using product mentions there and keep listening.');

const output = `${lines.join('\n')}\n`;

if (outputPath) {
  writeFileSync(outputPath, output);
} else {
  process.stdout.write(output);
}
