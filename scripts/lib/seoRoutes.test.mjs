import { describe, expect, it } from 'vitest';
import {
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
