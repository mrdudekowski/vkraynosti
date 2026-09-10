# SEO changelog

## 2026-09-09 — SEO V2 baseline and crawler-safe splash

- Fresh production crawl checked 47 sitemap URLs.
- Confirmed HTTP 200, canonical and indexability on sitemap routes; confirmed real 404/noindex fallback.
- Removed static loading copy and progress semantics from `index.html`; browser runtime still renders the user loading experience.
- Added source and regression guards for crawler-safe splash behavior.
- Documented P0/P1/P2 priorities, semantic architecture, publishing and archive controls.
- Deliberately did not add fake sitemap `lastmod`, unsupported Product/Event fields, or claims based on unavailable GSC/Yandex data.

## Prior relevant state

- Generated sitemap and robots are part of the deploy pipeline.
- Tour detail pages have `TouristTrip` and `BreadcrumbList` JSON-LD.
- The deployed post-deploy check validates sitemap routes and a 404 probe.
