# SEO Baseline Audit (Phase 1)

Generated: 2026-04-29T06:57:19.353Z

## Route Inventory

- Static indexable routes: /, /tours/winter, /tours/spring, /tours/summer, /tours/fall, /safety, /privacy
- Tour detail routes: 23
- Total planned indexable URLs: 30

## Metadata Foundation Checks

- [x] Canonical tag in shared meta layer: Found in PageMeta
- [x] Meta robots in shared meta layer: Found in PageMeta
- [x] Open Graph URL: Found in PageMeta
- [x] Twitter card: Found in PageMeta
- [x] JSON-LD structured data support: Supported in PageMeta
- [x] 404 is noindex: NotFound page sets noindex

## Crawlability & Indexability Checks

- [x] robots.txt exists: public/robots.txt found
- [x] sitemap.xml exists: public/sitemap.xml found (30 URLs)
- [x] Single SEO source of truth: src/constants/seo.ts detected

## SPA SEO Risk Snapshot

- Router mode: createBrowserRouter (client-side SPA)
- Deployment baseline: GitHub Pages with 404 redirect fallback
- Risk status: Requires periodic deep-link validation on deployed environment

## Coverage Notes

- PageMeta references sampled in key files: 6
- Home structured data schema wired: yes
- Missing data for full production-grade audit: live crawl logs, Search Console coverage, CWV field data (CrUX/RUM)
