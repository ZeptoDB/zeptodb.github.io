---
title: "Agent Memory vs Vector Databases"
template: splash
prev: false
next: false
description: "Compare ZeptoDB Agent Memory with standalone vector databases: semantic recall alone vs time-series evidence, prompt cache, context assembly, and replayable AgentOps telemetry."
---

## Overview

Vector databases are useful when the main problem is semantic retrieval over documents, chunks, summaries, or embeddings.

Operational agents need more than semantic similarity. They need context tied to time: what changed, what evidence was available, which memory was retrieved, whether a prompt cache hit happened, which tool or model was called, and what happened afterward.

ZeptoDB Agent Memory is built for that second shape. It stores memories and embeddings, but keeps them beside a microsecond time-series engine so agent behavior can be replayed as a timeline.

---

## Feature Comparison

| Need | Standalone vector database | ZeptoDB Agent Memory |
|------|----------------------------|----------------------|
| Semantic memory search | Yes | Yes, with client-supplied embeddings |
| Tenant/session filters | Varies by product | First-class tenant, namespace, user, session, agent, type, TTL, metadata |
| Prompt cache | Usually separate | Exact and semantic cache layer |
| Time-series evidence | Separate database required | Native time-series engine |
| AgentOps telemetry | Separate logging stack | Runs, retrievals, cache events, LLM calls/errors, context traces, replay windows, and tool calls as tables |
| Cluster operation | Product-specific distributed index | Routed writes, fan-out search/context, semantic-cache fan-out, cluster stats, replica WAL policy |
| Temporal joins | Not the core model | ASOF JOIN and Window JOIN |
| Replay decisions | Requires integration work | Evidence, memory, cache, tools, and outcome share one timeline |
| Python zero-copy | Not typical | 522ns query result to NumPy |
| Best fit | RAG over documents | Agents attached to live operational systems |

---

## When a Vector Database Is Enough

Use a standalone vector database when:

- Your primary workload is document retrieval.
- You do not need to replay time-ordered operational evidence.
- Prompt cache and model-call telemetry can live elsewhere.
- Your application already has a strong event store and only needs semantic search.

That is a valid architecture. ZeptoDB is not trying to replace every vector database.

---

## When ZeptoDB Fits Better

Use ZeptoDB when:

- The agent acts on live time-series data.
- You need to explain decisions with raw evidence, not only similar memories.
- Prompt cache events and model calls should be queryable beside operational events.
- Tenant/session/user/agent filters are part of recall quality.
- Clustered operation should keep memory routing and time-series evidence under one deployment model.
- You need ASOF JOIN, Window JOIN, and SQL over the same timeline.
- Python model loops should avoid serialization overhead.

Examples:

- Factory maintenance agents combining vibration history, work orders, and prior diagnoses
- Trading agents pairing market ticks, strategy memory, cache hits, and compliance replay
- Robotics agents replaying sensor fusion, actions, operator interventions, and policy notes
- Observability agents joining metrics, traces, deploys, runbooks, tool calls, and remediation outcomes

---

## Architecture Difference

```text
Standalone vector stack

events/logs  -> time-series DB
documents    -> vector DB
prompts      -> cache
agent runs   -> observability/logging
replay       -> custom integration
```

```text
ZeptoDB

live events  -> time-series tables
memories     -> Agent Memory
prompts      -> exact/semantic cache
agent runs   -> AgentOps tables
replay       -> SQL over the shared timeline
```

The difference is not "vectors or no vectors." ZeptoDB stores client-supplied embeddings. The difference is whether memory remains attached to the event stream that made it useful.

---

## Current Boundary

Agent Memory has a routed multi-node operating path for writes, point reads, fan-out memory search/context, semantic-cache fan-out, owner-local persistence, replica WAL durability policy, cluster-scoped stats, and owner-failover reporting. Shard migration dual-write/catch-up remains future work.

If you need distributed vector search across hundreds of millions of embeddings today, use a dedicated vector database. If you need operational memory beside fast time-series evidence, ZeptoDB is the more direct fit.

---

## Next Steps

- Read the [Agent Memory guide](/use-cases/agent-memory/)
- Review [benchmarks](/benchmarks/)
- Learn [why agent memory needs time-series data](/blog/why-agent-memory-needs-time-series/)
