# ZeptoDB GA4 tracking plan

Measurement ID is supplied at build time through `PUBLIC_GA_MEASUREMENT_ID`. Do not commit the ID into source.

The event queue runs on local previews for QA, but the Google tag loader only transmits from `zeptodb.com`, `www.zeptodb.com`, or `zeptodb.github.io`. This keeps localhost testing out of production reports.

## Promotion funnel

1. Discovery: `page_view`, `scroll_depth`
2. Evidence: `research_click`, `benchmark_click`, `comparison_click`
3. Evaluation: `action_outcome_click`, `use_case_click`, `docs_click`, `blog_click`
4. Activation: `quickstart_click`, `code_copy`, `github_click`, `community_click`

The site also records `social_click`, `outbound_click`, and `internal_link_click` for supporting navigation.

## Event parameters

Every custom event includes:

- `page_path`
- `page_title`
- `content_group`
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` when present

Link events also include:

- `link_url`
- `link_text`
- `link_domain`
- `destination_path`
- `destination_group`
- `nav_area`

GitHub, community, social, scroll, and code-copy events add their relevant target parameter.

## GA4 setup

Register these event-scoped custom dimensions in GA4 Admin > Data display > Custom definitions:

- `content_group`
- `destination_group`
- `nav_area`
- `github_target`
- `community_platform`
- `social_platform`
- `utm_content`

Register `percent_scrolled` as an event-scoped custom metric. GA4 already provides source, medium, campaign, page path, link URL, and link text in standard reports, so avoid duplicate custom definitions for those fields unless a specific exploration requires them.

Mark `quickstart_click`, `code_copy`, `github_click`, and `community_click` as key events after enough baseline data exists to confirm they represent meaningful engagement.

## Campaign convention

Use stable lowercase values:

```text
utm_source=x|threads|linkedin|reddit|hn|discord|newsletter
utm_medium=organic_social|community|referral|email
utm_campaign=<topic-or-launch-name>
utm_content=<post-angle-or-creative-id>
```

Keep `utm_campaign` stable across a campaign and vary `utm_content` for copy, image, or hook experiments. The site stores the first UTM context in session storage so downstream clicks remain attributable after internal navigation.
