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
  it('uses current CMS routes instead of stale static slugs when auditing hidden links', async () => {
    const currentPath = '/tours/fall/synthetic-test-tour';
    const input = await buildSeoRouteIntegrityInput({
      rootDir: process.cwd(),
      sitemapXml: '<urlset><url><loc>https://vkraynosti.ru/</loc></url></urlset>',
      statusByPath: new Map([[currentPath, 'active']]),
      renderablePaths: ['/', currentPath],
      legacyRedirectPaths: [],
      publishedCmsTours: [{ id: 'fall-1', season: 'fall', slug: 'synthetic-test-tour', status: 'active' }],
      generatedHtmlByPath: { '/': `<a href="${currentPath}">Current route</a>` },
    });

    expect(input.activePaths).toEqual(['/tours/fall/synthetic-test-tour/']);
    expect(input.hiddenPaths).not.toContain('/tours/fall/osen-voskhozhdenie-na-pidan/');
    expect(input.internalLinks).toEqual([
      { from: '/', to: '/tours/fall/synthetic-test-tour/' },
    ]);
  });

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
