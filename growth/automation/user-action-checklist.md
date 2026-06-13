# User Action Checklist

These are the tasks the owner must complete before full automation can run live.

## Accounts To Verify

- [ ] Google Search Console property for `https://zeptodb.com/`
- [ ] Bing Webmaster Tools property for `https://zeptodb.com/`
- [ ] Analytics tool installed on the site
- [ ] GitHub repository access for site deployment
- [ ] Official Threads account
- [ ] Meta developer app with Threads API access
- [ ] Reddit developer app for approved tooling
- [ ] Official LinkedIn company page or founder account

## Decisions To Make

- [ ] Keep `GPTBot` allowed for training, or allow only `OAI-SearchBot` for search?
- [ ] Replace public email `skswlsaks@gmail.com` with a role email such as `founder@zeptodb.com` or `sales@zeptodb.com`?
- [ ] Pick the canonical analytics tool.
- [ ] Decide who approves Reddit and Hacker News replies.
- [ ] Decide whether Threads can auto-publish approved queue items.
- [ ] Decide whether LinkedIn is founder-led, company-led, or both.

## Secrets To Add

Do not commit these values.

- [ ] `INDEXNOW_KEY`
- [ ] `BING_WEBMASTER_API_KEY`
- [ ] `THREADS_ACCESS_TOKEN`
- [ ] `THREADS_USER_ID`
- [ ] `REDDIT_CLIENT_ID`
- [ ] `REDDIT_CLIENT_SECRET`
- [ ] `REDDIT_USER_AGENT`
- [ ] `OPENAI_API_KEY`, only if using automated prompt testing
- [ ] `SLACK_WEBHOOK_URL` or `DISCORD_WEBHOOK_URL` for alerts

## One-Time Search Setup

- [ ] Submit `https://zeptodb.com/sitemap-index.xml` to Google Search Console.
- [ ] Submit `https://zeptodb.com/sitemap-index.xml` to Bing Webmaster Tools.
- [ ] Configure IndexNow and host the key file in `public/`.
- [ ] Confirm `https://zeptodb.com/robots.txt` is reachable.
- [ ] Confirm `https://zeptodb.com/llms.txt` is reachable after deploy.
- [ ] Confirm `https://zeptodb.com/ai-index.json` is reachable after deploy.
- [ ] Inspect the homepage and Agent Memory page in Google Search Console.

## First Live Run

- [ ] Deploy the public files.
- [ ] Run `pnpm growth:links`.
- [ ] Publish 2 Threads posts from the approved draft queue.
- [ ] Log 25 opportunities in `growth/opportunity-log.csv`.
- [ ] Draft 10 replies.
- [ ] Publish up to 5 Reddit replies manually after rules check.
- [ ] Update the weekly report.
