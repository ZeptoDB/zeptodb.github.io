# Autonomy Levels

Use this file to decide what the growth system may do without human review.

## Level 0 - Manual Only

Human performs the action directly.

Examples:

- Create new Reddit account or post from a personal account.
- Reply inside competitor-owned communities.
- Make legal, security, compliance, or benchmark superiority claims.
- Answer enterprise procurement questions.
- Send private messages.

## Level 1 - Automated Discovery

Automation may collect or generate links, but may not publish.

Allowed:

- Generate Reddit and Threads search queues.
- Build keyword and community lists.
- Generate UTM links.
- Score opportunities from manually entered logs.
- Produce draft responses.
- Produce weekly reports.

Required guardrail:

- Store only the minimum public URL, keyword, score, and notes needed for outreach.

## Level 2 - Automated Drafting

Automation may draft content for review.

Allowed:

- Threads post drafts.
- LinkedIn post drafts.
- Reddit answer drafts.
- Hacker News launch drafts.
- GitHub discussion answer drafts.
- Blog or documentation outline drafts.

Required guardrail:

- All claims must route to canonical docs.
- Benchmark claims must point to `/benchmarks/`.
- Product mentions in third-party communities must include affiliation disclosure.

## Level 3 - Owned-Channel Publishing

Automation may publish on surfaces ZeptoDB owns or controls.

Allowed after credentials are configured:

- Website docs and blog updates through the normal deployment flow.
- GitHub repo profile/README updates after review.
- Company-owned Threads posts from approved queue.
- Company-owned LinkedIn posts from approved queue.

Required guardrail:

- Keep an audit log of post body, URL, UTM link, timestamp, and account.

## Level 4 - Semi-Autonomous Community Replies

Automation may prepare exact replies and alert the owner, but the owner clicks publish.

Allowed:

- Reddit comment drafts.
- Hacker News comment drafts.
- Discord/Slack answer drafts.

Required guardrail:

- Check community rules before use.
- One link maximum unless explicitly allowed.
- No repeated copy-paste language.
- Reply must be useful without the ZeptoDB link.

## Level 5 - Fully Autonomous Third-Party Replies

Not approved for week 1.

Do not enable until:

- The account has a history of trusted participation.
- Platform API use is approved and compliant.
- Community-specific rules are encoded.
- Rate limits and deduplication are implemented.
- A kill switch exists.
- Negative feedback monitoring exists.

## Default Policy

- Owned website and machine-readable discovery: Level 3.
- Search/indexing submissions: Level 3.
- Threads brand account: Level 3 after credentials and review queue exist.
- Reddit: Level 4 only.
- Hacker News: Level 4 only.
- Private messages: Level 0.
