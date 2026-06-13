#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { readCsv } from './growth-utils.mjs';

const checks = [
  {
    path: 'growth/audience-map.csv',
    minRows: 10,
    requiredHeaders: ['segment', 'persona', 'buying_trigger', 'landing_page', 'priority'],
  },
  {
    path: 'growth/community-watchlist.csv',
    minRows: 50,
    requiredHeaders: ['channel', 'community', 'category', 'audience_fit', 'posture', 'first_action', 'risk'],
  },
  {
    path: 'growth/keyword-bank.csv',
    minRows: 100,
    requiredHeaders: ['cluster', 'keyword', 'intent', 'priority', 'landing_page'],
  },
  {
    path: 'growth/opportunity-log.csv',
    minRows: 1,
    requiredHeaders: [
      'date',
      'status',
      'channel',
      'community',
      'source_url',
      'keyword',
      'segment',
      'product_fit',
      'reply_risk',
      'posture',
      'landing_page',
      'utm_url',
      'next_action',
      'outcome',
      'notes',
    ],
  },
  {
    path: 'growth/campaign-links.csv',
    minRows: 8,
    requiredHeaders: ['id', 'path', 'source', 'medium', 'campaign', 'content', 'term'],
  },
  {
    path: 'growth/ai-search-prompts.csv',
    minRows: 20,
    requiredHeaders: ['engine', 'prompt', 'expected_zeptodb_page', 'priority', 'notes'],
  },
  {
    path: 'growth/ai-search-citation-log.csv',
    minRows: 1,
    requiredHeaders: [
      'date',
      'engine',
      'prompt',
      'zeptodb_appeared',
      'cited_url',
      'answer_accuracy',
      'competitors_cited',
      'next_fix',
      'notes',
    ],
  },
];

const validPostures = new Set(['listen_only', 'draft_only', 'comment_only', 'post_and_reply', 'owned_channel', 'submit_when_ready', 'post_only', 'manual_only', 'submit_pr']);
const errors = [];
const summaries = [];
const requiredFiles = [
  'public/robots.txt',
  'public/llms.txt',
  'public/ai-index.json',
  'growth/automation/README.md',
  'growth/automation/autonomy-levels.md',
  'growth/automation/credentials-checklist.md',
  'growth/automation/llm-search-strategy.md',
  'growth/automation/operator-runbook.md',
  'growth/automation/user-action-checklist.md',
  'growth/automation/measurement-plan.md',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    errors.push(`${file}: missing file`);
  } else {
    summaries.push(`${file}: present`);
  }
}

if (existsSync('public/ai-index.json')) {
  try {
    const aiIndex = JSON.parse(readFileSync('public/ai-index.json', 'utf8'));
    for (const key of ['name', 'url', 'shortDescription', 'primaryPages', 'crawlPolicy']) {
      if (!aiIndex[key]) errors.push(`public/ai-index.json: missing key ${key}`);
    }
  } catch (error) {
    errors.push(`public/ai-index.json: invalid JSON (${error.message})`);
  }
}

if (existsSync('public/llms.txt')) {
  const llms = readFileSync('public/llms.txt', 'utf8');
  for (const requiredText of ['ZeptoDB', 'Canonical Pages', 'Citation Guidance']) {
    if (!llms.includes(requiredText)) {
      errors.push(`public/llms.txt: missing section or text ${requiredText}`);
    }
  }
}

for (const check of checks) {
  if (!existsSync(check.path)) {
    errors.push(`${check.path}: missing file`);
    continue;
  }

  const { headers, records } = readCsv(check.path);
  const missing = check.requiredHeaders.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    errors.push(`${check.path}: missing headers ${missing.join(', ')}`);
  }

  if (records.length < check.minRows) {
    errors.push(`${check.path}: expected at least ${check.minRows} rows, got ${records.length}`);
  }

  if (check.path.endsWith('community-watchlist.csv')) {
    for (const [index, record] of records.entries()) {
      if (!validPostures.has(record.posture)) {
        errors.push(`${check.path}:${index + 2}: invalid posture ${record.posture}`);
      }
    }
  }

  if (check.path.endsWith('ai-search-prompts.csv')) {
    for (const [index, record] of records.entries()) {
      const priority = Number(record.priority);
      if (!Number.isInteger(priority) || priority < 1 || priority > 3) {
        errors.push(`${check.path}:${index + 2}: invalid priority ${record.priority}`);
      }

      if (!record.expected_zeptodb_page.startsWith('https://zeptodb.com/')) {
        errors.push(`${check.path}:${index + 2}: expected page must be a zeptodb.com URL`);
      }
    }
  }

  summaries.push(`${check.path}: ${records.length} rows`);
}

for (const summary of summaries) {
  console.log(summary);
}

if (errors.length > 0) {
  console.error('\nValidation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nGrowth kit validation passed.');
