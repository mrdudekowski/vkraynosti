import { describe, expect, it } from 'vitest';

import { collectSeoDistErrors } from './verify-seo-dist.mjs';

describe('verify-seo-dist', () => {
  it('reports a sitemap route whose rendered file is missing', async () => {
    const errors = await collectSeoDistErrors({
      rootDir: 'E:/fixture',
      distDir: 'E:/fixture/dist',
      sitemapXml: '<urlset><url><loc>https://vkraynosti.ru/</loc></url></urlset>',
      readFile: async () => '<html><head></head><body></body></html>',
      fileExists: () => false,
      expectedRoutes: ['/'],
      renderableRoutes: ['/'],
    });

    expect(errors).toContain('missing rendered HTML for sitemap route: /');
  });

  it('accepts indexable privacy in sitemap when rendered HTML is indexable', async () => {
    const html =
      '<!doctype html><html><head><title>Privacy</title>' +
      '<meta name="description" content="Privacy policy">' +
      '<meta name="robots" content="index,follow">' +
      '<link rel="canonical" href="https://vkraynosti.ru/privacy/">' +
      '<meta property="og:title" content="Privacy">' +
      '<meta property="og:description" content="Privacy policy">' +
      '<meta property="og:image" content="https://vkraynosti.ru/og-cover-prod.jpg">' +
      '</head><body><main><h1>Privacy</h1></main></body></html>';
    const errors = await collectSeoDistErrors({
      rootDir: 'E:/fixture',
      distDir: 'E:/fixture/dist',
      sitemapXml: '<urlset><url><loc>https://vkraynosti.ru/privacy/</loc></url></urlset>',
      readFile: async () => html,
      fileExists: (filePath) => filePath.endsWith('privacy/index.html'),
      expectedRoutes: ['/privacy/'],
      renderableRoutes: ['/privacy/'],
    });

    expect(errors).toEqual([]);
  });
});
