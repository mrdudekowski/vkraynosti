# VKRAYNOSTI SEO V2 — audit and playbook

Дата аудита: 2026-09-09. Ветка: `cms-crm-phase1-staging`.

## Current SEO health

### Confirmed production baseline

| Check | Result | Evidence |
|---|---|---|
| Sitemap | PASS | `https://vkraynosti.ru/sitemap.xml`, 47 URLs |
| Public URL status | PASS | All 47 sitemap URLs returned HTTP 200 |
| Canonical/robots | PASS | Every checked sitemap URL had self-path canonical and `index,follow` |
| 404 | PASS | Probe returned HTTP 404 and noindex |
| Metadata | PASS | One H1, title, description and canonical per crawled URL |
| Loading layer | FIXED IN SOURCE | Static shell no longer contains loading copy/progress semantics; runtime inserts them for browsers |
| GSC/Yandex data | GAP | Account access was not available in this workspace |
| CWV/real bot logs | GAP | Requires Search Console, CrUX/RUM and server/CDN logs |

### Important interpretation

The crawl proves technical availability and crawlable HTML, not guaranteed indexing, ranking, or AI citation. Google recommends crawlable links, useful content, valid metadata and structured data; Yandex separately exposes robot, sitemap and site-structure controls. See [Google Search Essentials](https://developers.google.com/search/docs/essentials) and [Yandex Webmaster help](https://yandex.com/support/webmaster/en/).

## Fixed in this slice

- Removed loading phrase and ARIA progress attributes from static `index.html`.
- Preserved browser-only splash rendering in `public/boot-splash-runtime.js`.
- Added regression checks so the loading UI cannot become semantic content of the initial HTML again.
- Kept the existing noindex 404, generated sitemap/robots flow, canonical layer and post-deploy smoke check.

## P0 / P1 / P2 backlog

### P0 — protect indexability

- Keep every sitemap URL HTTP 200, self-canonical and indexable.
- Keep unknown routes real HTTP 404 with noindex; do not serve a soft-404 page with HTTP 200.
- Preserve the CMS publication contract: only `active` tours enter sitemap; `in_development` is rendered but noindex; hidden tours stay out of public discovery.
- Never let a loading screen replace the server/SSG content shell.

### P1 — improve qualified search coverage

- Connect GSC and Yandex Webmaster; export queries/pages, excluded reasons, crawl stats and CWV monthly.
- Resolve CMS/static catalogue source-of-truth drift in SSG, OG shell, sitemap and runtime paths before scaling route creation.
- Maintain distinct season landing pages and tour detail pages; add internal links from season pages to active tours and back via breadcrumbs.
- Improve descriptions from real route facts and intent, not length-padding. Avoid unsupported prices, dates, availability and markup.
- Add a truthful archive policy for past tours: retain evergreen route content, remove stale availability, and use noindex/redirect only when the business decision requires it.

### P2 — growth and conversion

- Build intent-led pages only after GSC/Wordstat/Keyword Planner demand validation.
- Improve image filenames, descriptive alt text, compression and LCP after field measurement.
- Test title/description variants by CTR, not by arbitrary character count.
- Expand local entity signals: consistent NAP, legal contact page, map/profile links, reviews and route-specific trust content.

## Search architecture

- `/` — brand/entity and broad Primorye travel intent.
- `/tours/{season}/` — seasonal discovery and category intent.
- `/tours/{season}/{slug}/` — one route, one canonical URL, commercial/informational route intent.
- `/safety`, `/privacy` — useful support pages, excluded from sitemap by current policy.
- `/telegram/*` — application surfaces, not SEO landing pages.

Do not create near-duplicate pages for every phrase. Each indexable URL must answer a distinct search intent and link to a real published experience.

## Owner access needed for the next audit

1. Verify `vkraynosti.ru` in Google Search Console and Yandex Webmaster.
2. Export the last 3 months for clicks, impressions, CTR, average position, indexed/not-indexed reasons, page experience and top queries.
3. Share exports or screenshots without passwords/tokens. Re-run this playbook and map each issue to a URL and owner.

## Verification commands

```powershell
npm run seo:check
node scripts/check-seo-indexing.mjs --base https://vkraynosti.ru
node --check public/boot-splash-runtime.js
```

The full test/build suite must be reported separately if dependencies are unavailable; a passing SEO smoke check is not a substitute for a production build.
