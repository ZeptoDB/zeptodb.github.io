#!/usr/bin/env node

import { buildUtmUrl } from './growth-utils.mjs';

const [pathOrUrl, source, medium, campaign, content, term] = process.argv.slice(2);

function fail(message) {
  console.error(message);
  console.error(
    'Usage: node scripts/growth-utm.mjs <path-or-url> <source> <medium> <campaign> <content> [term]',
  );
  process.exit(1);
}

if (!pathOrUrl) fail('Missing path or URL.');

try {
  console.log(buildUtmUrl(pathOrUrl, { source, medium, campaign, content, term }));
} catch (error) {
  fail(error.message);
}
