# Reddit Agent Memory Playbook

Use this playbook to build reputation in AI-agent-memory conversations before
introducing ZeptoDB.

## Positioning

The first goal is to become useful in threads about:

- agent memory architecture
- long-term memory quality
- vector-store limits for agent memory
- AgentOps and replay
- prompt cache and memory observability
- live data and agent decision loops

The default answer should teach a pattern. ZeptoDB should appear only when a
thread explicitly asks for implementation options or when a product disclosure is
clearly useful.

## Daily Cadence

- Prepare 3 candidate replies per day.
- Publish only after reading the thread and subreddit rules.
- Rewrite every draft for the actual question.
- Prefer 0 ZeptoDB mentions during the first 14 days.
- After the first 14 days, keep at least 5 non-promotional comments for every 1
  disclosed ZeptoDB mention.
- Stop product mentions in any community that reacts negatively.

## Allowed Automation

Allowed:

- Create daily search queues.
- Suggest relevant communities and keywords.
- Draft comments for review.
- Create UTM links for approved product mentions.
- Create GitHub issues with a daily checklist.

Not allowed:

- Unattended Reddit comments.
- Repeated copy-paste replies.
- Hidden affiliation.
- Multiple-account engagement.
- Upvote, karma, or ranking manipulation.
- Private messages.

## Comment Shape

Good comments usually have this shape:

1. Name the tradeoff in the original question.
2. Give a concrete architecture pattern.
3. Mention when the pattern fails.
4. Ask one clarifying question or offer a practical next step.
5. Add ZeptoDB only if the thread asks for tools, and disclose affiliation.

## Product Mention Rule

Use this only when the thread asks for tools, databases, or implementation
options:

```text
Disclosure: I work on ZeptoDB, so I am biased. The reason we care about this
shape is that agent memory, prompt/cache events, and time-series evidence often
need to be replayed together in production systems.
```

Use one relevant link at most, with a Reddit UTM URL from the daily queue.
