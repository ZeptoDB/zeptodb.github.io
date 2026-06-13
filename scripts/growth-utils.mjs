import { readFileSync } from 'node:fs';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);

  if (rows.length === 0) return { headers: [], records: [] };

  const headers = rows[0].map((value) => value.trim());
  const records = rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  );

  return { headers, records };
}

export function readCsv(path) {
  return parseCsv(readFileSync(path, 'utf8'));
}

export function slug(value, field = 'value') {
  if (!value) throw new Error(`Missing ${field}.`);

  const next = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!next) throw new Error(`Invalid ${field}: ${value}`);
  return next;
}

export function buildUtmUrl(pathOrUrl, params, base = process.env.ZEPTO_BASE_URL || 'https://zeptodb.com') {
  const url = new URL(pathOrUrl, base);

  url.searchParams.set('utm_source', slug(params.source, 'source'));
  url.searchParams.set('utm_medium', slug(params.medium, 'medium'));
  url.searchParams.set('utm_campaign', slug(params.campaign, 'campaign'));
  url.searchParams.set('utm_content', slug(params.content, 'content'));

  if (params.term) {
    url.searchParams.set('utm_term', slug(params.term, 'term'));
  }

  return url.href;
}

export function csvEscape(value) {
  const text = String(value ?? '');
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((value) => value.startsWith(prefix));
  if (!arg) return fallback;
  const value = arg.slice(prefix.length);
  return value === '' ? fallback : value;
}
