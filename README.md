# ZeptoDB Documentation Site

Astro + Starlight documentation site for [ZeptoDB](https://github.com/ZeptoDB/ZeptoDB).

## How It Works

Documentation lives in the main `ZeptoDB/ZeptoDB` repo under `docs/`. This site pulls those docs at build time and renders them with Astro Starlight.

**Auto-deploy flow:**
1. Push docs changes to `ZeptoDB/ZeptoDB` → `docs/**`
2. GitHub Actions sends the merged source SHA to `ZeptoDB/zeptodb.github.io` via `repository_dispatch`
3. The site checks out that exact SHA and `sync-docs.mjs` copies and transforms the public docs
4. Type checks, rendered-site QA, and growth validation run before GitHub Pages deployment

Only changes represented in `ZeptoDB/ZeptoDB/docs` are synchronized. A code-only change does not update the site automatically; update the relevant public reference or guide in the same source change.

## Local Development

```bash
# Install exactly what CI uses
pnpm install --frozen-lockfile

# Sync local ZeptoDB docs, generate social assets, and start the dev server
ZEPTODB_DOCS_PATH=../zeptodb/docs pnpm dev

# Full release gate: build, type check, links/fragments/SEO, and growth assets
ZEPTODB_DOCS_PATH=../zeptodb/docs pnpm qa

# Preview the successful build
pnpm preview
```

`pnpm build` and `pnpm dev` use `../zeptodb/docs` by default. This includes uncommitted local source documents, so inspect `public/docs-sync.json` or the QA summary before treating a local preview as production-equivalent.

The sync is fail-closed: a missing source directory stops the build instead of reusing old generated content. `ZEPTODB_ALLOW_STALE_DOCS=1` exists only for an intentional, non-release design preview; the full QA gate still rejects that preview because it has no source manifest.

Generated files under `src/content/docs`, `src/generated`, and `public/og` must not be committed. The manually maintained pages are the explicit exceptions in `.gitignore`.

## Updating the Site from ZeptoDB

1. Update code and its user-visible docs in the same ZeptoDB branch.
2. If an API, CLI, configuration, install version, or product capability changed, update the corresponding file under `docs/api`, `docs/getting-started`, `docs/deployment`, or `docs/operations`.
3. For a new public experiment, first reconcile the experiment spec, raw result, status, limitations, and measured claims. Then add its stable mapping in `src/data/experiment-routes.mjs`. Update `src/content/docs/experiments/index.mdx` only when the latest-result narrative changes, and add curated claims to `src/data/action-outcome-experiments.ts` only when the experiment should be highlighted.
4. Run the site QA against the exact ZeptoDB branch before merging either repository. The Site QA workflow's `source_ref` input supports a pushed ZeptoDB branch or SHA.
5. For a new experiment, merge the mapping-only site compatibility change first; redirects are emitted only when the source-backed canonical page exists. Then merge the ZeptoDB source so its exact-SHA dispatch publishes the page. Add optional latest-result or curated marketing presentation only after the source page exists. For other coupled presentation changes, keep both branches tested with `source_ref` and merge in the shortest safe sequence.
6. Confirm the Pages job reports the same source SHA and smoke-check the homepage, docs home, quick start, API reference, experiments catalog, sitemap, and `docs-sync.json`.

Do not publish backlog, completion reports, commercial plans, credentials, internal operations, or unreviewed benchmark claims. New source Markdown is fail-closed until it is explicitly classified in `src/data/public-docs.mjs` or, for experiments, `src/data/experiment-routes.mjs`. Comparison claims must name the competitor version and review date and cite a primary source. Quantitative claims must link hardware, dataset, command, run date, and raw result. Classification and rendered-site QA are safeguards, not substitutes for source review.

The rendered-site gate fails on missing source provenance, internal routes, broken links or fragments, duplicate metadata, canonical and sitemap mismatches, invalid structured data, missing experiment dates, unsafe redirects, and missing core pages. Visual, keyboard-only, competitor-fact, and production smoke checks remain human review gates and are captured in the companion maintenance Skill.

## Setup (one-time)

### 1. GitHub Pages
Enable GitHub Pages in repo settings → Source: GitHub Actions.

### 2. Deploy Token
Create a Personal Access Token (PAT) with `repo` scope.
Add it as `SITE_DEPLOY_TOKEN` secret in the `ZeptoDB/ZeptoDB` repo.

### 3. Trigger Workflow
Copy `trigger-site-build.yml.example` to `ZeptoDB/ZeptoDB/.github/workflows/trigger-site-build.yml`.

## Project Structure

```
├── src/
│   ├── content/
│   │   └── docs/          # Generated source docs + explicitly tracked site pages
│   │       ├── index.mdx  # Manually maintained homepage
│   │       ├── docs.mdx   # Manually maintained docs landing page
│   │       └── experiments/index.mdx # Curated experiment catalog
│   ├── content.config.ts  # Starlight content collection config
│   ├── assets/            # Logo SVGs
│   └── styles/brand.css   # ZeptoDB brand colors
├── scripts/
│   ├── sync-docs.mjs      # Fail-closed docs sync + source manifest
│   └── qa-site.mjs        # Rendered link, metadata, redirect, and asset QA
├── src/data/public-docs.mjs # Explicit source-document publication approvals
├── astro.config.mjs        # Starlight config + sidebar
└── .github/workflows/
    ├── build-deploy.yml    # Exact-SHA CI/CD pipeline
    └── qa.yml              # Pull-request QA
```

## Tech Stack

- [Astro](https://astro.build) v6
- [Starlight](https://starlight.astro.build) v0.38
- [Pagefind](https://pagefind.app) (static search)
- GitHub Pages (hosting)
