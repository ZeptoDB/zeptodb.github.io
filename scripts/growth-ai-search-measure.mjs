#!/usr/bin/env node

import { appendFileSync, existsSync } from 'node:fs';
import { csvEscape, getArg, readCsv } from './growth-utils.mjs';

const PROMPTS_PATH = 'growth/ai-search-prompts.csv';
const LOG_PATH = 'growth/ai-search-citation-log.csv';
const mode = getArg('mode', 'report');
const today = new Date().toISOString().slice(0, 10);
const date = getArg('date', today);
const priorityArg = getArg('priority', '');
const priorityLimit = priorityArg ? Number(priorityArg) : null;
const append = getArg('append', 'false') === 'true';

const promptRows = readCsv(PROMPTS_PATH).records
  .filter((record) => !priorityLimit || Number(record.priority) <= priorityLimit)
  .sort((a, b) => {
    const byPriority = Number(a.priority) - Number(b.priority);
    if (byPriority !== 0) return byPriority;
    return `${a.engine}:${a.prompt}`.localeCompare(`${b.engine}:${b.prompt}`);
  });

const logRows = existsSync(LOG_PATH)
  ? readCsv(LOG_PATH).records.filter((record) => record.engine !== 'template')
  : [];

function isYes(value) {
  return ['yes', 'y', 'true', '1'].includes(String(value || '').trim().toLowerCase());
}

function isAccurate(value) {
  return ['accurate', 'yes', 'y', 'true', '1'].includes(String(value || '').trim().toLowerCase());
}

function groupBy(rows, key) {
  const groups = new Map();
  for (const row of rows) {
    const value = row[key] || 'unknown';
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(row);
  }
  return groups;
}

function queue() {
  console.log(`# AI Search Measurement Queue - ${date}\n`);
  console.log('Run these prompts manually in each engine. Record the answer in `growth/ai-search-citation-log.csv`.\n');

  for (const [engine, rows] of groupBy(promptRows, 'engine')) {
    console.log(`## ${engine}\n`);
    for (const row of rows) {
      console.log(`- [ ] P${row.priority} ${row.prompt}`);
      console.log(`      Expected: ${row.expected_zeptodb_page}`);
      if (row.notes) console.log(`      Notes: ${row.notes}`);
    }
    console.log('');
  }

  console.log('After checking, generate CSV placeholders with:');
  console.log(`pnpm growth:ai-search -- --mode=template --date=${date}`);
}

function templateRows() {
  const existing = new Set(
    logRows
      .filter((record) => record.date === date)
      .map((record) => `${record.engine}\n${record.prompt}`),
  );

  const rows = promptRows
    .filter((prompt) => !existing.has(`${prompt.engine}\n${prompt.prompt}`))
    .map((prompt) => [
      date,
      prompt.engine,
      prompt.prompt,
      '',
      '',
      '',
      '',
      '',
      `Expected page: ${prompt.expected_zeptodb_page}; Priority: ${prompt.priority}; ${prompt.notes || ''}`.trim(),
    ]);

  return rows;
}

function template() {
  const rows = templateRows();
  const text = rows.map((row) => row.map(csvEscape).join(',')).join('\n');

  if (append) {
    if (rows.length > 0) appendFileSync(LOG_PATH, `${text}\n`);
    console.log(`Appended ${rows.length} AI search check row(s) for ${date} to ${LOG_PATH}.`);
    return;
  }

  console.log('date,engine,prompt,zeptodb_appeared,cited_url,answer_accuracy,competitors_cited,next_fix,notes');
  if (text) console.log(text);
}

function report() {
  const rows = logRows.filter((record) => !date || record.date === date);

  console.log(`# AI Search Visibility Report - ${date}\n`);

  if (rows.length === 0) {
    console.log('No logged checks yet.');
    console.log(`\nCreate placeholders with: pnpm growth:ai-search -- --mode=template --date=${date} --append=true`);
    console.log(`Run the queue with: pnpm growth:ai-search -- --mode=queue --date=${date}`);
    return;
  }

  const total = rows.length;
  const appeared = rows.filter((row) => isYes(row.zeptodb_appeared)).length;
  const cited = rows.filter((row) => row.cited_url && row.cited_url.includes('zeptodb.com')).length;
  const accurate = rows.filter((row) => isAccurate(row.answer_accuracy)).length;

  console.log(`- Checks: ${total}`);
  console.log(`- ZeptoDB appeared: ${appeared}/${total} (${Math.round((appeared / total) * 100)}%)`);
  console.log(`- ZeptoDB cited: ${cited}/${total} (${Math.round((cited / total) * 100)}%)`);
  console.log(`- Accurate answers: ${accurate}/${total} (${Math.round((accurate / total) * 100)}%)\n`);

  console.log('## By Engine\n');
  console.log('| Engine | Checks | Appeared | Cited | Accurate |');
  console.log('|---|---:|---:|---:|---:|');
  for (const [engine, engineRows] of groupBy(rows, 'engine')) {
    const engineTotal = engineRows.length;
    const engineAppeared = engineRows.filter((row) => isYes(row.zeptodb_appeared)).length;
    const engineCited = engineRows.filter((row) => row.cited_url && row.cited_url.includes('zeptodb.com')).length;
    const engineAccurate = engineRows.filter((row) => isAccurate(row.answer_accuracy)).length;
    console.log(`| ${engine} | ${engineTotal} | ${engineAppeared} | ${engineCited} | ${engineAccurate} |`);
  }

  const gaps = rows.filter((row) =>
    !isYes(row.zeptodb_appeared) ||
    !row.cited_url.includes('zeptodb.com') ||
    !isAccurate(row.answer_accuracy) ||
    row.next_fix,
  );

  console.log('\n## Follow-Ups\n');
  if (gaps.length === 0) {
    console.log('- No follow-ups logged.');
    return;
  }

  for (const row of gaps) {
    console.log(`- ${row.engine}: ${row.prompt}`);
    console.log(`  - appeared=${row.zeptodb_appeared || 'blank'}, cited=${row.cited_url || 'blank'}, accuracy=${row.answer_accuracy || 'blank'}`);
    if (row.competitors_cited) console.log(`  - competitors: ${row.competitors_cited}`);
    if (row.next_fix) console.log(`  - next fix: ${row.next_fix}`);
  }
}

if (mode === 'queue') {
  queue();
} else if (mode === 'template') {
  template();
} else if (mode === 'report') {
  report();
} else {
  console.error(`Unknown mode: ${mode}`);
  console.error('Use --mode=queue, --mode=template, or --mode=report.');
  process.exit(1);
}
