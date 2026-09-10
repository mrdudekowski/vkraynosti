import { describe, expect, it } from 'vitest';
import { buildSeoRouteIntegrityInput } from './verify-seo-route-integrity.mjs';

const sitemapXml = `
  <urlset>
    <url><loc>https://vkraynosti.ru/</loc></url>
    <url><loc>https://vkraynosti.ru/tours/summer/active-tour/</loc></url>
    <url><loc>https://vkraynosti.ru/tours/summer/dev-tour/</loc></url>
  </urlset>
`;

describe('generated SEO route artifacts', () => {
  it('builds an audit input from catalog statuses, Sitemap and generated HTML', async () => {
    const input = await buildSeoRouteIntegrityInput({
      siteRoot: 'https://vkraynosti.ru',
      sitemapXml,
      statusByPath: new Map([
        ['/tours/summer/active-tour/', 'active'],
        ['/tours/summer/dev-tour/', 'in_development'],
      ]),
      renderablePaths: ['/', '/tours/summer/active-tour/', '/tours/summer/dev-tour/'],
      legacyRedirectPaths: ['/tours/summer/summer-1/'],
      tourPublicPaths: [
        '/tours/summer/active-tour/',
        '/tours/summer/hidden-tour/',
        '/tours/summer/dev-tour/',
      ],
      generatedHtmlByPath: {
        '/': '<a href="/tours/summer/active-tour/">Active</a>',
        '/tours/summer/active-tour/': '<a href="/tours/summer/summer-1/">Legacy</a>',
        '/tours/summer/dev-tour/': '<a href="/tours/summer/unknown-tour/">Unknown</a>',
      },
    });

    expect(input.activePaths).toEqual(['/tours/summer/active-tour/']);
    expect(input.hiddenPaths).toEqual(['/tours/summer/hidden-tour/']);
    expect(input.inDevelopmentPaths).toEqual(['/tours/summer/dev-tour/']);
    expect(input.sitemapPaths).toEqual([
      '/',
      '/tours/summer/active-tour/',
      '/tours/summer/dev-tour/',
    ]);
    expect(input.internalLinks).toEqual([
      { from: '/', to: '/tours/summer/active-tour/' },
      { from: '/tours/summer/active-tour/', to: '/tours/summer/summer-1/' },
      { from: '/tours/summer/dev-tour/', to: '/tours/summer/unknown-tour/' },
    ]);
  });
});
