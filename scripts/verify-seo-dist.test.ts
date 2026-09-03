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

  it('accepts a complete indexable route and rejects closed routes in sitemap', async () => {
    const html = `<!doctype html><html><head>
      <title>Вкрайности</title>
      <meta name="description" content="Поездки по Приморью из Владивостока">
      <meta name="robots" content="index,follow">
      <link rel="canonical" href="https://vkraynosti.ru/">
      <meta property="og:title" content="Вкрайности">
      <meta property="og:description" content="Поездки по Приморью из Владивостока">
      <meta property="og:image" content="https://vkraynosti.ru/og-cover-prod.jpg">
      <script type="application/ld+json">{"@type":"Organization"}</script>
    </head><body><main><h1>Вкрайности</h1></main></body></html>`;
    const errors = await collectSeoDistErrors({
      rootDir: 'E:/fixture',
      distDir: 'E:/fixture/dist',
      sitemapXml: '<urlset><url><loc>https://vkraynosti.ru/</loc></url><url><loc>https://vkraynosti.ru/safety/</loc></url></urlset>',
      readFile: async () => html,
      fileExists: (filePath) => filePath.endsWith('index.html'),
      expectedRoutes: ['/'],
      renderableRoutes: ['/'],
    });

    expect(errors).toContain('non-indexable route is present in sitemap: /safety/');
  });
});
