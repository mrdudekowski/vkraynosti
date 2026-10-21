# Safety page without social metadata

## Goal

Keep `/safety` indexable while omitting Open Graph and Twitter metadata and the OG image from its generated HTML.

## Approved behavior

- Keep the page's SEO title, meta description, canonical URL, and `robots=index,follow`.
- Do not emit `og:*` or `twitter:*` tags for `/safety`.
- Do not resolve, copy, or require a social image for `/safety`.
- Continue generating the Safety route, its rendered body, and its sitemap entry.
- Keep the existing social metadata behavior for every other route.

## Implementation boundary

Use one opt-out on page metadata for social tags. Apply it to both the generated HTML shell and React `PageMeta`, which owns the head after hydration. Exclude Safety's social image from OG asset collection and do not add an Open Graph HTML prefix for that page. Keep core SEO metadata generation independent so crawlers retain the title, description, canonical URL, and indexing directive.

## Validation

- Unit-test Safety metadata in both the static shell and React head: indexable core SEO tags remain; OG/Twitter metadata is absent.
- Verify OG image collection does not include the Safety social image.
- Verify generated-route checks accept Safety without social tags while checking its title, description, canonical, robots directive, and rendered body.
- Run the deploy build where required CMS/CDN environment and assets are available.

## Alternatives considered

1. Keep the full generic OG block: conflicts with the requested behavior.
2. Remove only the OG image: leaves unnecessary social tags in place.
3. Omit OG and Twitter for Safety while preserving core SEO metadata: approved.
