# Full-Automation Foundation

This folder defines the base documents for autonomous ZeptoDB discovery and
marketing operations.

The goal is to maximize discovery in AI search, search engines, and community
channels without crossing into spam, impersonation, or platform abuse.

## Automation Philosophy

Automate discovery, indexing, drafting, measurement, and owned-channel publishing.
Gate public third-party replies behind policy checks and human approval until the
account has earned trust in each community.

The system should be able to run unattended for:

- sitemap and AI index publication
- IndexNow/Bing URL submission
- UTM link generation
- search queue generation
- AI visibility prompt tests
- owned content draft generation
- Threads draft and scheduling queue
- weekly reporting

The system should not run unattended for:

- Reddit comments
- Hacker News comments
- private messages
- competitor community posting
- benchmark claims in third-party communities
- legal, licensing, security, or compliance claims

## Public Machine-Readable Files

- `public/robots.txt`: crawler access policy.
- `public/llms.txt`: canonical AI-readable ZeptoDB summary and citation guide.
- `public/ai-index.json`: structured index of product positioning, claims, pages,
  use cases, and contact surfaces.

## Operating Files

- `autonomy-levels.md`: what can run automatically and what needs approval.
- `credentials-checklist.md`: accounts, tokens, and secrets the user must provide.
- `llm-search-strategy.md`: strategy for ChatGPT Search, Google AI features, Bing
  Copilot, Perplexity-style answer engines, and community citation signals.
- `operator-runbook.md`: daily and weekly run loop.
- `user-action-checklist.md`: concrete setup tasks for the human owner.
- `measurement-plan.md`: visibility, citation, traffic, and conversion metrics.

## Current Command Surface

```bash
pnpm growth:validate
pnpm growth:links
pnpm growth:search -- --communities=10 --keywords=25 --per-community=3
pnpm growth:score
```

## Next Build Targets

1. Add IndexNow submission script.
2. Add AI search prompt runner template.
3. Add automated sitemap URL extraction.
4. Add owned-channel content scheduler.
5. Add dashboard export from opportunity logs and campaign links.
