# SEO Phase 2 - Prioritization Matrix

Updated: 2026-04-29
Input baseline: `docs/SEO_BASELINE_PHASE1.md`

## Scoring Model

- Marketing impact: 1 (low) to 5 (very high)
- SEO risk: 1 (low) to 5 (very high)
- Effort: 1 (low) to 5 (high)
- Priority score = `(marketing impact + SEO risk) / effort`

## Critical

1) SPA rendering limitation on GitHub Pages (no prerender/SSR)
- Evidence: `createBrowserRouter` SPA routing in `src/router.tsx`; baseline risk note in phase 1 report.
- Marketing impact: 5
- SEO risk: 5
- Effort: 4
- Priority score: 2.5
- Why priority: this directly impacts crawl reliability and snippet eligibility for route pages.
- Phase 3 action: introduce prerender/SSG for key landing URLs and tour pages.

## High

1) Manual `sitemap.xml` is not self-updating
- Evidence: static file `public/sitemap.xml`; route inventory depends on `src/data/toursData.ts`.
- Marketing impact: 4
- SEO risk: 4
- Effort: 2
- Priority score: 4.0
- Why priority: every new/removed tour can silently desync sitemap and reduce index discovery.
- Phase 3 action: generate sitemap from `ROUTES` + `toursData` at build time.

2) No route-level JSON-LD for tour entities and breadcrumbs
- Evidence: only home-level schema in `src/pages/Home.tsx` (`ORGANIZATION_SCHEMA`, `WEBSITE_SCHEMA`).
- Marketing impact: 4
- SEO risk: 3
- Effort: 2
- Priority score: 3.5
- Why priority: rich signals for detail pages are missing even though metadata base is present.
- Phase 3 action: add `BreadcrumbList` + `TouristTrip`/`Product`-like schema on tour detail pages.

3) No automated SEO guard in CI
- Evidence: no SEO check script in workflow; deploy workflow runs lint/test/build only.
- Marketing impact: 4
- SEO risk: 4
- Effort: 2
- Priority score: 4.0
- Why priority: regressions in canonical/robots/title uniqueness can return quickly without hard checks.
- Phase 3 action: add `seo:baseline` (or stricter `seo:check`) to CI gate.

## Medium

1) Missing production visibility data sources
- Evidence: baseline notes missing Search Console coverage and field CWV.
- Marketing impact: 3
- SEO risk: 3
- Effort: 2
- Priority score: 3.0
- Why priority: prioritization quality stays limited without real impressions/clicks/CWV.
- Phase 3 action: connect Search Console + CWV RUM/CrUX tracking.

2) `sitemap.xml` lacks freshness metadata (`lastmod`, `changefreq`, `priority`)
- Evidence: `public/sitemap.xml` contains `<loc>` only.
- Marketing impact: 2
- SEO risk: 2
- Effort: 1
- Priority score: 4.0
- Why priority: lower strategic impact than coverage, but cheap win for crawler hints.
- Phase 3 action: enrich generated sitemap entries with metadata.

3) No social-level verification process for OG/Twitter previews
- Evidence: metadata is present in `PageMeta`, but no repeatable validation workflow documented.
- Marketing impact: 3
- SEO risk: 2
- Effort: 1
- Priority score: 5.0
- Why priority: high CTR leverage with very small effort.
- Phase 3 action: add release checklist step with route preview validation.

## Low

1) Title/description length and uniqueness limits are not enforced by script
- Evidence: data centralized in `src/constants/seo.ts`, but no hard validation rules.
- Marketing impact: 2
- SEO risk: 2
- Effort: 1
- Priority score: 4.0
- Why priority: foundation is strong already; this is optimization hardening.
- Phase 3 action: add lint-like checks for max length and duplicate descriptions.

## Execution Backlog (Phase 3 order)

1. Automate sitemap generation from source data (high ROI, low effort).
2. Add CI SEO checks (`seo:baseline`/`seo:check`) to prevent regressions.
3. Add route-level structured data for tours and breadcrumbs.
4. Define social preview validation checklist for key routes.
5. Design/prioritize prerender strategy for top indexable routes.
6. Add length/uniqueness metadata checks.
7. Connect Search Console and CWV monitoring inputs.

## Decision

Phase 2 status: complete.  
Phase 3 should start from backlog items 1-3 because they provide the best risk reduction per effort.
