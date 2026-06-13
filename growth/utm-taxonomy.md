# UTM Taxonomy

Every public link used in growth campaigns should identify source, medium, campaign,
content, and optionally term. Keep names lowercase, ASCII, and hyphenated.

## Required Fields

- `utm_source`: Platform or community source.
- `utm_medium`: Distribution mode.
- `utm_campaign`: Campaign or sprint.
- `utm_content`: Specific post, comment, or creative variant.

Optional:

- `utm_term`: Keyword, subreddit, or discussion theme.

## Source Names

- `reddit`
- `threads`
- `hackernews`
- `github`
- `discord`
- `slack`
- `linkedin`
- `email`
- `direct-community`

## Medium Names

- `comment`
- `post`
- `reply`
- `launch`
- `profile`
- `dm-approved`
- `docs`
- `newsletter`

Do not use `dm-approved` unless the user explicitly asked for private communication.

## Campaign Names

Use this pattern:

`YYYY-MM-topic`

Examples:

- `2026-06-agent-memory`
- `2026-06-vector-db-alt`
- `2026-06-timeseries-agents`
- `2026-06-robotics-memory`
- `2026-06-prompt-cache`

## Content Names

Use this pattern:

`community-thread-topic-variant`

Examples:

- `local-llama-memory-v1`
- `dataengineering-tsdb-v1`
- `threads-agentops-v2`
- `hn-show-launch-v1`

## Example Links

Agent Memory for a Reddit comment:

```text
https://zeptodb.com/use-cases/agent-memory/?utm_source=reddit&utm_medium=comment&utm_campaign=2026-06-agent-memory&utm_content=local-llama-memory-v1&utm_term=agent-memory
```

Vector DB comparison for a Threads post:

```text
https://zeptodb.com/compare/agent-memory-vs-vector-databases/?utm_source=threads&utm_medium=post&utm_campaign=2026-06-vector-db-alt&utm_content=threads-vector-db-v1&utm_term=vector-db-alternative
```

## CLI Helper

Use:

```bash
node scripts/growth-utm.mjs /use-cases/agent-memory/ reddit comment 2026-06-agent-memory local-llama-memory-v1 agent-memory
```

Set a different base URL:

```bash
ZEPTO_BASE_URL=http://localhost:4321 node scripts/growth-utm.mjs /features/ threads post 2026-06-timeseries-agents threads-tsdb-v1
```
