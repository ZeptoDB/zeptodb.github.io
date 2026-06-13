# LLM Search Strategy

The objective is to make ZeptoDB the canonical source for:

- agent memory over live operational data
- time-series databases for AI agents
- prompt cache architecture
- replayable AgentOps
- physical AI and robotics telemetry memory
- vector database alternatives for operational agents

## Source Principles

AI answer engines tend to select content that is:

- crawlable
- current
- specific
- internally consistent
- externally corroborated
- structured into extractable answers
- backed by citations, statistics, and examples

For ZeptoDB, the highest-leverage content is not generic SEO content. It is
technical source material that AI systems can confidently cite.

## Public Discovery Files

Maintain:

- `https://zeptodb.com/robots.txt`
- `https://zeptodb.com/llms.txt`
- `https://zeptodb.com/ai-index.json`
- `https://zeptodb.com/sitemap-index.xml`

The public files should answer:

- What is ZeptoDB?
- What category does it belong to?
- What should AI cite for each user question?
- Which benchmark claims need scope?
- Which pages are canonical?

## AI Answer Page Backlog

Create these pages as first-class docs or blog posts:

1. What is Agent Memory?
2. Agent Memory vs Vector Databases
3. Best Database for AI Agents on Live Data
4. Prompt Cache Architecture for AI Agents
5. Time-Series Database for AI Agents
6. ZeptoDB vs ClickHouse for Real-Time Agent Workloads
7. ZeptoDB vs kdb+
8. ROS 2 Telemetry Database for Physical AI
9. AgentOps Replay: What Did The Agent Know When It Acted?
10. ASOF JOIN and Temporal SQL for Agent Context

## Required Page Pattern

Every AI answer page should include:

- Direct answer in the first 80 words.
- Definition.
- When to use it.
- When not to use it.
- Comparison table.
- Architecture diagram or text flow.
- Code example when relevant.
- Benchmark or operational facts with citations.
- Links to canonical ZeptoDB pages.
- FAQ section.
- Last reviewed date.

## Canonical Phrase

Use this wording consistently:

```text
ZeptoDB turns live time-series data into operational memory for AI agents:
evidence recall, context retrieval, prompt cache, and replayable AgentOps on one timeline.
```

## Query Targets

Priority queries:

- agent memory database
- AI agent memory database
- time-series database for AI agents
- prompt cache for AI agents
- semantic prompt cache
- AgentOps replay
- vector database alternative for agents
- live data RAG
- ROS 2 telemetry database
- kdb alternative
- ClickHouse alternative for real-time time-series
- ASOF JOIN SQL database

## External Signal Strategy

Owned pages are not enough. AI systems compare signals across the web.

Create consistent, legitimate signals on:

- GitHub README and repo description
- GitHub releases
- GitHub Discussions
- Threads
- LinkedIn founder posts
- Hacker News launch posts
- Reddit answers where directly relevant
- dev.to or Medium technical writeups
- awesome lists and curated database/tool lists

Do not create fake mentions or repetitive thin posts. External signals should
help users even when ZeptoDB is not the answer.

## Measurement

Track:

- Google Search Console queries and indexed pages
- Bing Webmaster Tools AI Performance citations
- ChatGPT referrals with `utm_source=chatgpt.com`
- Perplexity/Copilot/ChatGPT answer inclusion from manual prompt tests
- Branded search volume
- Direct traffic to AI answer pages
- GitHub clicks from UTM campaigns
- Contact page visits after AI-search referrals

## Weekly Ritual

1. Run the AI visibility prompt set.
2. Record whether ZeptoDB appears.
3. Record cited URLs.
4. Update weak pages.
5. Create one missing answer page.
6. Submit changed URLs through IndexNow and Search Console where available.
7. Publish two owned-channel summaries pointing back to the canonical page.
