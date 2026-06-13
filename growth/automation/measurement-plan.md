# Measurement Plan

The goal is to measure whether ZeptoDB becomes discoverable and cited by AI
search systems, not just whether social posts get clicks.

## North Star

Qualified discovery:

- AI/search users land on ZeptoDB docs.
- Those users click GitHub, join Discord, or contact the team.
- AI systems cite the correct ZeptoDB page for category queries.

## Metrics

### AI Search Visibility

- ZeptoDB appears in answer: yes/no.
- ZeptoDB is cited: yes/no.
- Cited URL.
- Citation accuracy.
- Competitors cited.
- Missing page needed.

Run the weekly prompt set with:

```bash
pnpm growth:ai-search -- --mode=queue --date=YYYY-MM-DD
pnpm growth:ai-search -- --mode=template --date=YYYY-MM-DD --append=true
pnpm growth:ai-search -- --mode=report --date=YYYY-MM-DD
```

The source prompt set is `growth/ai-search-prompts.csv`; the measurement log is
`growth/ai-search-citation-log.csv`.

### Search Console

- Indexed pages.
- Queries containing:
  - agent memory
  - prompt cache
  - time-series database
  - vector database alternative
  - AgentOps
  - ROS 2 telemetry
- Click-through rate.
- Average position.
- Pages with impressions but low CTR.

### Bing Webmaster Tools

- AI citations.
- Cited pages.
- Grounding queries.
- Crawl and indexing status.
- IndexNow submissions.

### Analytics

- `utm_source=chatgpt.com`
- `utm_source=threads`
- `utm_source=reddit`
- `utm_source=hackernews`
- landing page sessions
- GitHub outbound clicks
- Discord outbound clicks
- contact page visits
- email clicks

GA4 is loaded only when `PUBLIC_GA_MEASUREMENT_ID` is set during the Astro build.
Track these custom events as conversion candidates:

- `github_click`
- `discord_click`
- `contact_click`
- `email_click`
- `outbound_click`

### Community

- High-intent opportunities logged.
- Drafts approved.
- Replies published.
- Reply sentiment.
- Moderator removals.
- Direct replies.
- Follow-up questions.

## Weekly Review Questions

- Which query did AI systems answer without citing ZeptoDB?
- Which ZeptoDB page should have been cited?
- Was the page too vague, stale, or hard to extract?
- Do we need a definition page, comparison page, or benchmark page?
- Which external source could corroborate the claim legitimately?

## Reporting Cadence

- Daily: opportunities, drafts, owned-channel posts.
- Weekly: AI search prompt tests and citation outcomes.
- Monthly: content gap review and backlink/community signal review.
