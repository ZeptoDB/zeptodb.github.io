# Operator Runbook

This is the weekly operating loop for autonomous ZeptoDB growth.

## Daily

1. Validate the growth kit.

```bash
pnpm growth:validate
```

2. Generate search queues.

```bash
pnpm growth:search -- --communities=10 --keywords=25 --per-community=3
```

3. Add promising public opportunities to:

```text
growth/opportunity-log.csv
```

4. Score logged opportunities.

```bash
pnpm growth:score
```

5. Draft responses for high-scoring opportunities only.

Use:

```text
growth/draft-queue.md
growth/campaigns/week-01-reddit-response-templates.md
```

6. Publish only where the autonomy level permits it.

## After Publishing Owned Content

1. Verify the page builds.
2. Confirm it appears in the sitemap.
3. Submit the URL through IndexNow once configured.
4. Request Google indexing through Search Console for important pages.
5. Add the page to `public/llms.txt` and `public/ai-index.json` if canonical.
6. Add UTM links to `growth/campaign-links.csv`.

## Weekly AI Visibility Test

Use:

```text
growth/ai-search-prompts.csv
```

Record:

- engine
- prompt
- whether ZeptoDB appears
- which URL is cited
- whether the answer is accurate
- next fix

## Kill Switches

Pause automation if:

- Reddit users object to product mentions.
- A platform blocks or rate-limits the account.
- A benchmark claim is challenged and cannot be sourced quickly.
- An AI answer misstates licensing, security, or performance.
- Analytics shows low-quality traffic from a channel.

## Weekly Output

Update:

```text
growth/reports/week-01-report.md
```

Include:

- published posts
- high-intent opportunities
- AI-search appearances
- cited URLs
- GitHub clicks
- contact/demo inquiries
- next week priorities
