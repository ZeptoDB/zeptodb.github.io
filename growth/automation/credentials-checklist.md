# Credentials Checklist

These are the accounts, tokens, and properties needed to move from local
automation to live autonomous operation.

Do not commit tokens to the repository. Store them in GitHub Actions secrets,
local `.env` files excluded from git, or the deployment platform secret manager.

## Search And AI Discovery

- Google Search Console property for `https://zeptodb.com/`
- Bing Webmaster Tools property for `https://zeptodb.com/`
- Bing IndexNow API key
- IndexNow key file hosted at `https://zeptodb.com/<key>.txt`
- Google Analytics 4 web data stream for `https://zeptodb.com/`
- GitHub Actions repository variable: `PUBLIC_GA_MEASUREMENT_ID`
- Access to server or CDN logs, if available

Suggested secrets:

```text
INDEXNOW_KEY=
BING_WEBMASTER_API_KEY=
GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL=
GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY=
```

Suggested repository variables:

```text
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## OpenAI And AI Search Monitoring

- OpenAI account for manual ChatGPT Search visibility checks
- Optional API key for automated prompt testing where permitted
- Analytics rule to track `utm_source=chatgpt.com`

Suggested secrets:

```text
OPENAI_API_KEY=
```

## Threads

- Meta developer app
- Threads account connected to the app
- Threads API access token
- Long-lived token refresh process
- Publishing permission for the brand account

Suggested secrets:

```text
THREADS_ACCESS_TOKEN=
THREADS_USER_ID=
```

## Reddit

Reddit is not approved for unattended publishing in week 1.

Needed for approved collection or authenticated tooling:

- Reddit developer app
- Client ID
- Client secret
- User agent string that identifies ZeptoDB tooling
- Account with clear brand/founder identity

Suggested secrets:

```text
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_REFRESH_TOKEN=
REDDIT_USER_AGENT=
```

## GitHub

- GitHub App or token with repo read/write access for ZeptoDB site automation
- Permission to update docs, public metadata, and GitHub Discussions if needed

Suggested secrets:

```text
GITHUB_TOKEN=
```

## LinkedIn

- Company page admin access
- LinkedIn developer app if API publishing is approved

Suggested secrets:

```text
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_ID=
```

## Email And Notifications

- Notification channel for high-intent opportunities
- Optional transactional email provider

Suggested secrets:

```text
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=
RESEND_API_KEY=
```

## Required Owner Decisions

- Allow GPTBot training access or allow only OAI-SearchBot search access?
- Use `skswlsaks@gmail.com` as public enterprise contact or replace with a role account?
- Which account is the official ZeptoDB Threads account?
- Which analytics tool should be canonical?
- Who approves Reddit and Hacker News replies?
