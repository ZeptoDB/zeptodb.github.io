#!/usr/bin/env node

import { readCsv } from './growth-utils.mjs';

const { records } = readCsv('growth/opportunity-log.csv');
const active = records.filter((record) => record.status !== 'template');

if (active.length === 0) {
  console.log('No active opportunities yet. Add rows to growth/opportunity-log.csv.');
  process.exit(0);
}

console.log('date,channel,community,keyword,score,recommendation,next_action');

for (const record of active) {
  const fit = Number(record.product_fit || 0);
  const risk = Number(record.reply_risk || 0);
  const score = fit * 2 - risk;
  let recommendation = 'listen_only';

  if (fit >= 4 && risk <= 2) {
    recommendation = 'draft_response';
  } else if (fit >= 4 && risk === 3) {
    recommendation = 'review_rules_first';
  } else if (fit >= 3 && risk <= 2) {
    recommendation = 'save_for_later';
  }

  console.log(
    [
      record.date,
      record.channel,
      record.community,
      record.keyword,
      score,
      recommendation,
      record.next_action,
    ].join(','),
  );
}
