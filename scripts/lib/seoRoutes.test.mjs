import { describe, expect, it } from 'vitest';
import {
  auditSeoRouteIntegrity,
  getRenderableRoutePaths,
  getSitemapRoutePaths,
  getStaticIndexableRoutePaths,
  getTourStatusByPublicPath,
  loadSeoRouteSources,
} from './seoRoutes.mjs';

const rootDir = process.cwd();

describe('catalog-aware SEO route sets', () => {
  it('sitemap contains active tours, excludes in_development; renderable contains both', async () => {
    const statusByPath = await getTourStatusByPublicPath(rootDir);
    const activePaths = [...statusByPath.entries()]
      .filter(([, status]) => status === 'active')
      .map(([path]) => path);
    const inDevPaths = [...statusByPath.entries()]
      .filter(([, status]) => status === 'in_development')
      .map(([path]) => path);

    const sitemap = new Set(await getSitemapRoutePaths(rootDir));
    const renderable = new Set(await getRenderableRoutePaths(rootDir));

    // Active tours are index-eligible and rendered.
    for (const path of activePaths) {
      expect(sitemap.has(path), `active in sitemap: ${path}`).toBe(true);
      expect(renderable.has(path), `active renderable: ${path}`).toBe(true);
    }

    // in_development: rendered (reachable) but kept out of the sitemap (noindex).
    for (const path of inDevPaths) {
      expect(sitemap.has(path), `in_dev NOT in sitemap: ${path}`).toBe(false);
      expect(renderable.has(path), `in_dev renderable: ${path}`).toBe(true);
    }
  });

  it('sitemap is a subset of renderable; both include static routes', async () => {
    const { routesSource } = await loadSeoRouteSources(rootDir);
    const staticRoutes = getStaticIndexableRoutePaths(routesSource);
    const sitemap = await getSitemapRoutePaths(rootDir);
    const renderable = new Set(await getRenderableRoutePaths(rootDir));

    for (const path of sitemap) {
      expect(renderable.has(path), `sitemap ⊆ renderable: ${path}`).toBe(true);
    }
    for (const path of staticRoutes) {
      expect(sitemap.includes(path), `static in sitemap: ${path}`).toBe(true);
    }
    expect(staticRoutes).toContain('/');
  });

  it('no renderable tour path lacks a catalog status (hidden tours never leak)', async () => {
    const statusByPath = await getTourStatusByPublicPath(rootDir);
    const renderable = await getRenderableRoutePaths(rootDir);
    const tourPaths = renderable.filter((path) => /^\/tours\/[^/]+\/[^/]+$/.test(path));

    for (const path of tourPaths) {
      expect(['active', 'in_development']).toContain(statusByPath.get(path));
    }
  });

  it('excludes Telegram Mini App routes from sitemap and data-SSG', async () => {
    const sitemap = await getSitemapRoutePaths(rootDir);
    const renderable = await getRenderableRoutePaths(rootDir);

    for (const path of [...sitemap, ...renderable]) {
      expect(path.startsWith('/telegram'), `non-SEO route leaked: ${path}`).toBe(false);
    }
  });
});

describe('SEO route integrity audit', () => {
  const baseInput = {
    activePaths: ['/tours/summer/active-tour/'],
    hiddenPaths: ['/tours/summer/hidden-tour/'],
    inDevelopmentPaths: ['/tours/summer/dev-tour/'],
    sitemapPaths: ['/tours/summer/active-tour/'],
    renderablePaths: [
      '/tours/summer/active-tour/',
      '/tours/summer/dev-tour/',
    ],
    legacyRedirectPaths: ['/tours/summer/summer-1/'],
    internalLinks: [
      { from: '/', to: '/tours/summer/active-tour/' },
    ],
  };

  it('accepts a consistent active, hidden, in-development and renderable route set', () => {
    expect(auditSeoRouteIntegrity(baseInput).violations).toEqual([]);
  });

  it('reports an active tour missing from the Sitemap', () => {
    const result = auditSeoRouteIntegrity({
      ...baseInput,
      sitemapPaths: [],
    });

    expect(result.violations).toContainEqual(
      expect.objectContaining({ code: 'active_not_in_sitemap', path: '/tours/summer/active-tour/' }),
    );
  });

  it('reports hidden and in-development tours leaked into the Sitemap', () => {
    const result = auditSeoRouteIntegrity({
      ...baseInput,
      sitemapPaths: [
        '/tours/summer/active-tour/',
        '/tours/summer/hidden-tour/',
        '/tours/summer/dev-tour/',
      ],
    });

    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'hidden_in_sitemap', path: '/tours/summer/hidden-tour/' }),
        expect.objectContaining({ code: 'in_development_in_sitemap', path: '/tours/summer/dev-tour/' }),
      ]),
    );
  });

  it('reports renderable routes missing from generated output and legacy links', () => {
    const result = auditSeoRouteIntegrity({
      ...baseInput,
      renderablePaths: ['/tours/summer/active-tour/'],
      internalLinks: [
        { from: '/', to: '/tours/summer/summer-1/' },
        { from: '/', to: '/tours/summer/hidden-tour/' },
        { from: '/', to: '/tours/summer/unknown-tour/' },
      ],
    });

    expect(result.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'in_development_not_renderable', path: '/tours/summer/dev-tour/' }),
        expect.objectContaining({ code: 'legacy_internal_link', path: '/tours/summer/summer-1/' }),
        expect.objectContaining({ code: 'hidden_internal_link', path: '/tours/summer/hidden-tour/' }),
        expect.objectContaining({ code: 'unknown_internal_link', path: '/tours/summer/unknown-tour/' }),
      ]),
    );
  });
});
