# Week 1 Checklist

## Day 1 - Foundation

- Confirm the primary conversion path: docs visit, GitHub star, Discord join, contact email, or demo request.
- Pick the first three landing pages for campaign traffic:
  - `/use-cases/agent-memory/`
  - `/compare/agent-memory-vs-vector-databases/`
  - `/getting-started/quick_start/`
- Create UTM links for every channel using `scripts/growth-utm.mjs`.
- Review `compliance-checklist.md` before any Reddit or Threads action.
- Pick 10 communities from `community-watchlist.csv` for manual inspection.

## Day 2 - Listening Pass

- Search the top 10 communities for the top 25 keywords in `keyword-bank.csv`.
- Log conversations that match one of these triggers:
  - They are choosing between a vector DB, cache, TSDB, or observability stack.
  - They complain about latency, context retrieval, replay, or agent memory quality.
  - They mention kdb+, ClickHouse, InfluxDB, TimescaleDB, LangGraph, AgentOps, ROS 2, or prompt cache.
- Score each opportunity from 1 to 5 for product fit and reply risk.
- Draft only for opportunities with product fit 4 or 5 and reply risk 1 or 2.

## Day 3 - First Draft Queue

- Draft 10 responses:
  - 4 for agent memory and vector DB discussions.
  - 2 for time-series database comparisons.
  - 2 for robotics, IoT, or edge telemetry discussions.
  - 1 for quant/trading infrastructure.
  - 1 for AgentOps or observability.
- For Reddit, include product disclosure when ZeptoDB is mentioned.
- Make each answer useful even if the ZeptoDB link is removed.
- Reject drafts that repeat the same sentence shape or CTA.

## Day 4 - Threads Content Batch

- Turn the strongest docs pages into 8 short Threads posts:
  - 2 on agent memory failures.
  - 2 on time-series evidence for agents.
  - 1 on prompt cache economics.
  - 1 on replayable AgentOps.
  - 1 on robotics/Physical AI.
  - 1 on kdb+/ClickHouse positioning.
- Keep each post to one idea.
- Use no more than one link per post.
- Prepare alt text for any image post.

## Day 5 - Publish and Measure

- Publish 2 to 4 Threads posts.
- Publish or comment on up to 5 Reddit opportunities after manual review.
- Record:
  - URL
  - community
  - message pillar
  - UTM link
  - reply count
  - upvotes/likes
  - site sessions
  - GitHub clicks
  - contacts or direct replies

## Day 6 - Learn

- Identify the top 5 keywords by reply quality.
- Identify the top 5 communities by fit.
- Identify the top 3 landing pages by click quality.
- Remove communities where self-promotion or vendor replies are clearly unwelcome.
- Add new phrases found in real posts to `keyword-bank.csv`.

## Day 7 - Next Sprint Plan

- Pick the top 3 channels for week 2.
- Pick the first automation source to build:
  - RSS/search alert collector
  - Reddit approved API collector
  - Threads publishing queue
  - GitHub issue/discussion listener
- Define the week 2 dashboard fields.
- Decide which responses can be templatized and which must stay custom.
