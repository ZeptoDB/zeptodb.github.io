# Content Pillars

## Pillar 1 - Agent Memory Needs Live Evidence

Audience:

- Agent builders
- AgentOps teams
- ML platform engineers

Message:

Most memory systems store summaries or embeddings without the event stream that made
those memories true. Operational agents need the sequence of facts, retrieved memories,
tool calls, model calls, and outcomes.

Best landing page:

- `/use-cases/agent-memory/`

First-week angles:

- "Memory without the timeline is a detached note."
- "An agent should remember what mattered and still query what actually happened."
- "The hard part is not storing embeddings. It is replaying the chain from signal to decision."

## Pillar 2 - Prompt Cache Is A Product Feature, Not Just Infra

Audience:

- Founders
- Agent product teams
- Cost-conscious engineering managers

Message:

Repeated operational questions should not always hit the provider. Exact and semantic
cache lookup can reduce repeated model calls while preserving a replayable trail.

Best landing page:

- `/use-cases/agent-memory-python-quickstart/`

First-week angles:

- "If the same alert repeats, the model should not be the first cache layer."
- "Prompt cache needs tenant, namespace, and policy boundaries."
- "Cache hits are also audit events."

## Pillar 3 - Time-Series Databases Are Becoming Agent Infrastructure

Audience:

- Data engineers
- Database evaluators
- Observability teams

Message:

Operational agents run on changing systems. They need low-latency temporal queries,
ordered events, temporal joins, and current evidence before acting.

Best landing pages:

- `/features/`
- `/benchmarks/`

First-week angles:

- "Agents attached to live systems need time-series recall, not just search."
- "Temporal joins are agent context infrastructure."
- "Microsecond evidence recall matters when retrieval sits inside the agent loop."

## Pillar 4 - ZeptoDB Is A Practical Alternative For Specific Hot Paths

Audience:

- Teams evaluating kdb+, ClickHouse, InfluxDB, TimescaleDB, or vector DBs
- Quant and high-frequency telemetry teams

Message:

ZeptoDB should not be framed as a generic replacement for every workload. It is for
live time-series evidence, agent memory, prompt cache, and replayable operational context.

Best landing pages:

- `/compare/vs-kdb/`
- `/compare/vs-clickhouse/`
- `/compare/agent-memory-vs-vector-databases/`

First-week angles:

- "ClickHouse is excellent OLAP. The question is whether the agent loop can wait."
- "kdb+ proves microsecond time-series matters. ZeptoDB brings that shape toward SQL and agent memory."
- "Vector DBs are useful, but they do not explain what happened before the memory."

## Pillar 5 - Physical AI And Edge Agents Need Replay

Audience:

- Robotics engineers
- Industrial IoT teams
- Autonomous systems builders

Message:

Robots, factories, vehicles, and edge systems need a durable timeline of sensor state,
operator action, retrieved memory, and agent decisions.

Best landing pages:

- `/use-cases/robotics/`
- `/use-cases/iot/`
- `/use-cases/autonomous-vehicles/`

First-week angles:

- "A robot agent needs to remember previous interventions and replay the sensor evidence."
- "Factory agents need telemetry, maintenance memory, and action history in one place."
- "Replay is the difference between a demo and an operable system."

## Draft Quality Bar

- Make one concrete claim per post.
- Prefer examples over slogans.
- Link only when the link answers the thread.
- Do not repeat the same CTA.
- Use benchmark numbers only with scope and reproduction context.
- Avoid attacking competitors. Explain fit and tradeoffs.
