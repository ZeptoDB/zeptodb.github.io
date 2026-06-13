# Week 1 Threads Posts

These are draft posts for the first Threads batch. Review current product claims before
publishing. Use one UTM link per post at most.

## Post 1 - Agent Memory Needs Evidence

Most agent memory systems store summaries or embeddings.

Operational agents need one more thing: the event stream that made the memory true.

If the agent recommends an action, you should be able to replay the facts, retrieved
memories, cache hit or miss, tool call, model call, and outcome.

Link:

```bash
node scripts/growth-utm.mjs /use-cases/agent-memory/ threads post 2026-06-agent-memory threads-agent-memory-v1 agent-memory
```

## Post 2 - Prompt Cache Before Provider Calls

If the same operational question repeats, the provider should not always be the first stop.

A practical agent loop can check exact cache, semantic cache, live evidence, and durable
memory before paying for another model call.

The cache hit should still be an audit event.

Link:

```bash
node scripts/growth-utm.mjs /use-cases/agent-memory-python-quickstart/ threads post 2026-06-prompt-cache threads-prompt-cache-v1 prompt-cache
```

## Post 3 - AgentOps Replay

Agent observability is not only traces.

For production agents, the useful question is often:

"What did the agent know when it acted?"

That means storing raw events, retrieved context, prompt cache decisions, model calls,
tool calls, and outcomes on one replayable timeline.

Link:

```bash
node scripts/growth-utm.mjs /use-cases/agent-memory/ threads post 2026-06-agent-memory threads-agentops-replay-v1 agentops
```

## Post 4 - Vector DB Tradeoff

Vector databases are useful for similarity.

But operational agents also need timing:

What changed before the alert?
Which memory was retrieved?
Was the answer cached?
Which tool was called?
What happened afterward?

That sequence is a time-series problem too.

Link:

```bash
node scripts/growth-utm.mjs /compare/agent-memory-vs-vector-databases/ threads post 2026-06-vector-db-alt threads-vector-db-v1 vector-db-alternative
```

## Post 5 - Robotics Replay

A robot agent needs more than a memory note.

It needs the sensor timeline, action history, previous interventions, and the outcome of
similar episodes.

That is where ROS 2 telemetry and agent memory start to look like the same system.

Link:

```bash
node scripts/growth-utm.mjs /use-cases/robotics/ threads post 2026-06-robotics-memory threads-robotics-v1 robot-agent-memory
```

## Post 6 - Time-Series In The Agent Loop

Retrieval latency matters before the model call too.

If context retrieval sits inside the agent loop, the database path becomes part of the
product experience.

Slow evidence recall makes the agent feel slow before the LLM starts generating.

Link:

```bash
node scripts/growth-utm.mjs /benchmarks/ threads post 2026-06-timeseries-agents threads-latency-v1 microsecond-query-latency
```

## Post 7 - kdb+ And SQL

kdb+ proved that microsecond time-series systems matter.

The next question for many teams is whether they can get that style of hot-path temporal
workload with standard SQL, Python, and agent memory on the same operational timeline.

Link:

```bash
node scripts/growth-utm.mjs /compare/vs-kdb/ threads post 2026-06-timeseries-agents threads-kdb-v1 kdb-alternative
```

## Post 8 - The Practical Test

A useful agent memory system should answer:

- What happened?
- What mattered last time?
- What context did we retrieve?
- Did we reuse a cached answer?
- What did the agent do?
- What happened after?

If those live in separate stores, debugging becomes archaeology.

Link:

```bash
node scripts/growth-utm.mjs /use-cases/agent-memory/ threads post 2026-06-agent-memory threads-practical-test-v1 replayable-agent-decisions
```
