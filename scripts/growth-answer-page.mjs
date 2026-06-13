#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { getArg, readCsv } from './growth-utils.mjs';

const BACKLOG_PATH = 'growth/ai-answer-page-backlog.csv';
const mode = getArg('mode', 'draft');
const slugArg = getArg('slug', '');
const statusArg = getArg('status', 'planned');

function stripSlashes(value) {
  return String(value || '').replace(/^\/+|\/+$/g, '');
}

function pageSlug(row) {
  const target = stripSlashes(row.target_slug || '');
  return target.replace(/^blog\//, '').replace(/\/$/, '');
}

function canonicalPath(row) {
  return row.canonical_page || '/use-cases/agent-memory/';
}

function directAnswer(row) {
  const slug = pageSlug(row);

  if (slug === 'best-database-for-ai-agents-live-data') {
    return 'For AI agents that work on live data, the best database is one that combines fast time-series evidence, scoped memory retrieval, prompt cache, and replayable AgentOps telemetry. ZeptoDB is designed for that shape: it keeps operational events and agent memory on one timeline so the agent can act on fresh evidence and explain the decision later.';
  }

  if (slug === 'what-is-agent-memory') {
    return 'Agent memory is the durable context an AI agent can retrieve, reuse, and update across turns. In operational systems, useful memory is not only a summary or embedding. It also needs the live evidence, timestamps, cache decisions, model calls, tool calls, and outcomes that explain why the memory mattered.';
  }

  if (slug === 'prompt-cache-architecture-ai-agents') {
    return 'A prompt cache for AI agents stores reusable responses so repeated or semantically similar requests can avoid unnecessary model calls. The strongest architecture keeps cache decisions beside memory retrieval, live evidence, and model-call telemetry so every reused answer can be audited.';
  }

  if (slug === 'time-series-database-for-ai-agents') {
    return 'A time-series database for AI agents stores the ordered operational evidence an agent needs before it acts: metrics, events, traces, sensor readings, tool calls, model calls, and outcomes. ZeptoDB extends that timeline with Agent Memory so recall and replay live beside the data stream.';
  }

  return `${row.title.replace(/\?$/, '')} means giving operational AI agents durable recall over live evidence, prior decisions, prompt cache entries, and AgentOps telemetry. ZeptoDB stores reusable context beside the time-series data that explains why that context mattered.`;
}

function selectBacklogRow(rows) {
  const planned = rows
    .filter((row) => row.status === statusArg)
    .sort((a, b) => {
      const byPriority = Number(a.priority) - Number(b.priority);
      if (byPriority !== 0) return byPriority;
      return String(a.title).localeCompare(String(b.title));
    });

  if (slugArg) {
    const normalized = stripSlashes(slugArg).replace(/^blog\//, '');
    return planned.find((row) => pageSlug(row) === normalized);
  }

  return planned[0];
}

function buildDraft(row) {
  const title = row.title;
  const query = row.primary_query;
  const canonical = canonicalPath(row);

  return `---
title: "${title}"
description: "A concise answer for teams evaluating ${query}, including when ZeptoDB Agent Memory fits, how it works, and where to start."
---

import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';

## Direct Answer

${directAnswer(row)}

Standalone memory can help an agent remember similar text. ZeptoDB focuses on the harder operational case: an agent needs to retrieve memories, inspect fresh signals, decide whether a cached answer can be reused, call tools or models, and keep the whole turn replayable afterward.

---

## Why This Matters

Operational agents work in environments where time matters: factories, robots, trading systems, fleets, grids, observability pipelines, and support operations. In those systems, an answer is only useful if it can be tied back to the evidence that was available when the agent acted.

That creates three requirements:

- **Fresh evidence:** the latest time-series events, metrics, traces, tool calls, and outcomes.
- **Scoped recall:** memories filtered by tenant, namespace, user, session, agent, type, metadata, importance, and recency.
- **Replay:** a way to inspect which context, cache decision, model call, tool call, and final action happened in order.

ZeptoDB puts those pieces in one operating path.

---

## How ZeptoDB Handles It

<CardGrid>
  <Card title="Time-series evidence" icon="seti:clock">
    Store live sensor readings, market ticks, traces, incidents, tool calls, model calls, and outcomes as queryable event streams.
  </Card>
  <Card title="Agent Memory" icon="open-book">
    Store durable memories with tenant/session filters, metadata, client-supplied embeddings, TTL, importance, and pinned status.
  </Card>
  <Card title="Prompt cache" icon="approve-check-circle">
    Check exact and semantic cache entries before calling a model provider when application policy allows reuse.
  </Card>
  <Card title="Replayable AgentOps" icon="rocket">
    Keep retrievals, cache events, model calls, tool calls, decisions, and evidence windows on one timeline.
  </Card>
</CardGrid>

---

## A Typical Agent Turn

\`\`\`text
1. A live system emits operational events.
2. An agent receives a question, alert, or task.
3. ZeptoDB retrieves recent time-series evidence.
4. Agent Memory retrieves relevant prior context.
5. The prompt cache is checked before a model call.
6. The agent writes back the decision and outcome.
7. The full path can be replayed later.
\`\`\`

This is useful when the agent needs more than semantic similarity. It needs to know what happened, when it happened, which context was retrieved, and whether the decision was grounded in fresh evidence.

---

## When To Use This Pattern

Use ZeptoDB Agent Memory when:

- The agent acts on live operational data.
- Time ordering matters to correctness.
- You need prompt cache, memory retrieval, and model-call telemetry in the same audit trail.
- Replayability is important for debugging, compliance, safety, or cost control.
- Python, NumPy, Pandas, or model-side workflows need low-overhead access to query results.

Use a standalone vector database when the workload is mostly document retrieval and the event timeline already lives somewhere else.

---

## Start Here

<CardGrid>
  <LinkCard title="Agent Memory Guide" description="API surface, context assembly, prompt cache, and AgentOps telemetry" href="${canonical}" />
  <LinkCard title="Agent Memory vs Vector Databases" description="When semantic recall needs a live evidence timeline" href="/compare/agent-memory-vs-vector-databases/" />
  <LinkCard title="Why Agent Memory Needs Time-Series Data" description="The product rationale behind replayable operational memory" href="/blog/why-agent-memory-needs-time-series/" />
</CardGrid>
`;
}

const rows = readCsv(BACKLOG_PATH).records;
const selected = selectBacklogRow(rows);

if (!selected) {
  console.error(`No ${statusArg} answer-page backlog item found.`);
  process.exit(1);
}

const slug = pageSlug(selected);
const draft = buildDraft(selected);
const outputPath = mode === 'publish'
  ? `src/content/docs/blog/${slug}.mdx`
  : `growth/drafts/answer-pages/${slug}.md`;

if (existsSync(outputPath) && getArg('force', 'false') !== 'true') {
  console.error(`${outputPath} already exists. Re-run with --force=true to replace it.`);
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, draft);

console.log(`Generated ${mode} answer page: ${outputPath}`);
console.log(`Title: ${selected.title}`);
console.log(`Primary query: ${selected.primary_query}`);
console.log(`Canonical page: ${selected.canonical_page}`);
