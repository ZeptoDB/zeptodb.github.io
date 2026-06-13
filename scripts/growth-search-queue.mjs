#!/usr/bin/env node

import { getArg, readCsv } from './growth-utils.mjs';

const communityLimit = Number(getArg('communities', 10));
const keywordLimit = Number(getArg('keywords', 25));
const perCommunity = Number(getArg('per-community', 3));

const communities = readCsv('growth/community-watchlist.csv').records;
const keywords = readCsv('growth/keyword-bank.csv').records
  .map((record, index) => ({ ...record, index }))
  .sort((a, b) => Number(a.priority) - Number(b.priority) || a.index - b.index)
  .slice(0, keywordLimit);

const redditCommunities = communities
  .filter((record) => record.channel === 'reddit' && !['listen_only'].includes(record.posture))
  .slice(0, communityLimit);

const threadKeywords = communities
  .filter((record) => record.channel === 'threads')
  .slice(0, Math.max(3, Math.min(communityLimit, 7)));

function redditUrl(community, keyword) {
  const subreddit = community.replace(/^r\//, '');
  const url = new URL(`https://www.reddit.com/r/${subreddit}/search/`);
  url.searchParams.set('q', keyword);
  url.searchParams.set('restrict_sr', '1');
  url.searchParams.set('sort', 'new');
  return url.href;
}

function redditGlobalUrl(keyword) {
  const url = new URL('https://www.reddit.com/search/');
  url.searchParams.set('q', keyword);
  url.searchParams.set('sort', 'new');
  return url.href;
}

function threadsUrl(keyword) {
  const url = new URL('https://www.threads.com/search');
  url.searchParams.set('q', keyword);
  return url.href;
}

console.log('# Manual Search Queue\n');
console.log('Use these links for manual listening. Do not scrape or auto-post from this queue.\n');

console.log('## Reddit Community Searches\n');
for (const community of redditCommunities) {
  console.log(`### ${community.community}`);
  for (const keyword of keywords.slice(0, perCommunity)) {
    console.log(`- ${keyword.keyword}: ${redditUrl(community.community, keyword.keyword)}`);
  }
  console.log('');
}

console.log('## Reddit Global Searches\n');
for (const keyword of keywords.slice(0, 10)) {
  console.log(`- ${keyword.keyword}: ${redditGlobalUrl(keyword.keyword)}`);
}

console.log('\n## Threads Searches\n');
for (const community of threadKeywords) {
  const keyword = community.community.replace(/^keyword:\s*/, '');
  console.log(`- ${keyword}: ${threadsUrl(keyword)}`);
}

console.log('\n## Top Landing Pages\n');
const landingPages = new Map();
for (const keyword of keywords) {
  landingPages.set(keyword.landing_page, (landingPages.get(keyword.landing_page) || 0) + 1);
}
for (const [landingPage, count] of [...landingPages.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`- ${landingPage}: ${count} keyword(s)`);
}
