# SEO publishing checklist

## Before publishing a tour

- [ ] CMS record has a stable ID, title, slug and season.
- [ ] Publication status is intentional; only `active` is sitemap/index eligible.
- [ ] Description is unique and based on real route facts.
- [ ] Price, duration, difficulty, images and alt text are present and truthful.
- [ ] Program and included items are readable without client-side interaction.
- [ ] Future dates come only from the schedule source; no invented dates.
- [ ] Canonical path, OG image and JSON-LD resolve to the same tour.

## After deployment

- [ ] `npm run seo:check` passes.
- [ ] `node scripts/check-seo-indexing.mjs --base https://vkraynosti.ru` passes.
- [ ] Open the route as a fresh browser navigation and with JavaScript disabled if possible.
- [ ] Check one mobile viewport and one social preview.
- [ ] Submit the canonical URL for recrawl only after HTTP, content and canonical checks pass.
