import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_SITE_URL = 'https://mrdudekowski.github.io/vkraynosti';

/** Same rules as src/constants/siteUrl.ts + vite base for cutover. */
export function resolveSiteRoot(env = process.env) {
  const customSiteUrl = (env.VITE_SITE_URL || '').trim();
  if (!customSiteUrl) {
    return DEFAULT_SITE_URL.replace(/\/+$/, '');
  }
  const origin = customSiteUrl.replace(/\/+$/, '');
  const basePath = (env.VITE_BASE_PATH || '/').trim();
  if (!basePath || basePath === '/') {
    return origin;
  }
  const baseNorm = basePath.replace(/\/+$/, '');
  return `${origin}${baseNorm.startsWith('/') ? baseNorm : `/${baseNorm}`}`;
}

export function extractStaticRoutes(routesSource) {
  const matches = [...routesSource.matchAll(/^\s+([A-Z_]+):\s+'([^']+)'/gm)];
  return matches
    .map(([, , path]) => path)
    .filter((path) => !path.includes(':'));
}

export function extractTourUrlsFromCore(toursSource) {
  const matches = [...toursSource.matchAll(/id:\s*'([^']+)'.*?season:\s*'(winter|spring|summer)'/gs)];
  return matches.map(([, id, season]) => `/tours/${season}/${id}`);
}

export function extractFallTourUrls(fallImagesSource) {
  const arrayMatch = /const FALL_TOUR_IDS = \[([\s\S]*?)\] as const/.exec(fallImagesSource);
  if (!arrayMatch) {
    throw new Error('FALL_TOUR_IDS not found in fallTourImages.ts');
  }
  const ids = [...arrayMatch[1].matchAll(/'(fall-\d+)'/g)].map((match) => match[1]);
  return ids.map((id) => `/tours/fall/${id}`);
}

export async function loadSeoRouteSources(rootDir = process.cwd()) {
  const read = (filePath) => readFile(resolve(rootDir, filePath), 'utf8');
  const [routesSource, toursSource, fallImagesSource] = await Promise.all([
    read('src/constants/routes.ts'),
    read('src/data/toursData.ts'),
    read('src/constants/fallTourImages.ts'),
  ]);
  return { routesSource, toursSource, fallImagesSource };
}

/** Indexable SPA paths (same set as sitemap, excluding 404 wildcard). */
export async function getIndexableRoutePaths(rootDir = process.cwd()) {
  const { routesSource, toursSource, fallImagesSource } = await loadSeoRouteSources(rootDir);
  const staticRoutes = extractStaticRoutes(routesSource);
  const tourRoutes = [
    ...extractTourUrlsFromCore(toursSource),
    ...extractFallTourUrls(fallImagesSource),
  ];
  return [
    ...new Set([
      ...(staticRoutes.includes('/') ? [] : ['/']),
      ...staticRoutes,
      ...tourRoutes,
    ]),
  ];
}

export function routePathToDistFile(routePath, distDir) {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  if (normalized === '/') {
    return resolve(distDir, 'index.html');
  }
  const segments = normalized.replace(/^\//, '').split('/');
  return resolve(distDir, ...segments, 'index.html');
}
