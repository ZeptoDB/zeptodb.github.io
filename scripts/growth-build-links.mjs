#!/usr/bin/env node

import { buildUtmUrl, csvEscape, readCsv } from './growth-utils.mjs';

const { records } = readCsv('growth/campaign-links.csv');
const header = ['id', 'url', 'source', 'medium', 'campaign', 'content', 'term', 'owner', 'notes'];

console.log(header.join(','));

for (const record of records) {
  const url = buildUtmUrl(record.path, record);
  const row = [
    record.id,
    url,
    record.source,
    record.medium,
    record.campaign,
    record.content,
    record.term,
    record.owner,
    record.notes,
  ];
  console.log(row.map(csvEscape).join(','));
}
