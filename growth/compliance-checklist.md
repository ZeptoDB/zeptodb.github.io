# Compliance Checklist

This checklist is the gate before publishing or automating anything on Reddit, Threads,
or adjacent communities. Treat it as product safety for growth.

## Sources To Recheck

- Threads API overview: https://developers.facebook.com/docs/threads/overview/
- Threads API publishing: https://developers.facebook.com/docs/threads/posts/
- Threads API changelog: https://developers.facebook.com/docs/threads/changelog/
- Reddit API access: https://www.reddit.com/r/reddit.com/wiki/api/
- Reddit Responsible Builder Policy: https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy
- Reddit Developer Terms: https://redditinc.com/policies/developer-terms
- Reddit Data API Terms: https://redditinc.com/policies/data-api-terms

## Global Rules

- Do not impersonate a normal user when automation is involved.
- Do not use fake accounts, vote manipulation, fake engagement, or hidden sponsorship.
- Do not send automated private messages.
- Do not scrape or store more user data than needed for immediate growth operations.
- Do not train a model on Reddit content unless Reddit has explicitly approved that use.
- Do not publish benchmark claims without linking to scope, hardware, data shape, and measurement notes.
- Every product mention should disclose affiliation when the account is founder, employee, or official brand.
- Every reply must be useful without the ZeptoDB link.

## Reddit Gate

Reddit is human-approved only in week 1.

Before replying:

- Check the subreddit rules.
- Check whether vendor comments, launch posts, or self-promotion are allowed.
- Check whether the thread is asking for recommendations or merely venting.
- Confirm the response adds concrete technical help.
- Mention ZeptoDB only when directly relevant.
- Add disclosure if linking or recommending ZeptoDB.
- Use one link at most unless the community clearly allows more.
- Avoid repeated wording across multiple subreddits.
- Do not comment from a mixed personal/app automation account.

Approved Reddit response shape:

1. Answer the actual question.
2. Explain the architecture tradeoff.
3. Mention ZeptoDB only if it is directly relevant.
4. Disclose affiliation.
5. Add one specific link, preferably docs or benchmarks.

Example disclosure:

> I work on ZeptoDB, so discount the product mention accordingly.

## Threads Gate

Threads can be scheduled and published through the official API after account setup.

Before publishing:

- Keep posts paced and useful.
- Use one idea per post.
- Use no more than one primary link per post in week 1.
- Add alt text for images or video.
- Avoid repetitive replies.
- Do not exceed official API limits.
- Recheck the latest Threads changelog before building publisher automation.

Operational note:

- The Threads API currently supports publishing text, image, video, and carousel posts.
- The official overview documents a 250 API-published post limit per profile within a 24-hour moving period.
- The Threads changelog notes that posts with more than 5 links fail starting December 22, 2025.

## Approval Statuses

- `listen_only`: Collect and learn. Do not post.
- `draft_only`: Draft a response for review. Do not post directly.
- `comment_only`: Human-approved comments only.
- `post_and_reply`: Scheduled posts plus human-reviewed replies.
- `owned_channel`: ZeptoDB controls the surface. Still use quality and tracking gates.

## Rejection Reasons

- The user did not ask for a product or architecture recommendation.
- The community rules prohibit vendor promotion.
- The answer would be mostly a link.
- The answer repeats a recent post.
- The claim is not backed by current docs.
- The landing page does not match the thread.
- The post would create support burden we cannot answer quickly.
