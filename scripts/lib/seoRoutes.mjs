import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const DEFAULT_SITE_URL = 'https://vkraynosti.ru';

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

const TOUR_SLUG_ENTRY_PATTERN =
  /^\s+'((?:winter|spring|summer|fall)-\d+)':\s*'([^']+)',?\s*$/gm;

/** tour.id → slug from `src/data/tourSlugs.ts` (SSOT for sitemap / OG shells). */
export function parseTourSlugMap(tourSlugsSource) {
  const map = new Map();
  for (const [, tourId, slug] of tourSlugsSource.matchAll(TOUR_SLUG_ENTRY_PATTERN)) {
    map.set(tourId, slug);
  }
  return map;
}

function seasonFromTourId(tourId) {
  return tourId.split('-')[0];
}

/** Public tour paths from `tourSlugs.ts`. */
export function extractTourPublicUrlsFromSlugMap(tourSlugsSource) {
  const slugMap = parseTourSlugMap(tourSlugsSource);
  return [...slugMap.entries()].map(
    ([tourId, slug]) => `/tours/${seasonFromTourId(tourId)}/${slug}`,
  );
}

/** Legacy id paths for tours with slug (redirect shells only). */
export function extractLegacyTourRedirectUrls(tourSlugsSource) {
  const slugMap = parseTourSlugMap(tourSlugsSource);
  return [...slugMap.entries()].map(
    ([tourId]) => `/tours/${seasonFromTourId(tourId)}/${tourId}`,
  );
}

export async function loadSeoRouteSources(rootDir = process.cwd()) {
  const read = (filePath) => readFile(resolve(rootDir, filePath), 'utf8');
  const [routesSource, tourSlugsSource] = await Promise.all([
    read('src/constants/routes.ts'),
    read('src/data/tourSlugs.ts'),
  ]);
  return { routesSource, tourSlugsSource };
}

/** Routes with noindex at runtime — excluded from sitemap and indexable OG shells. */
export const NON_INDEXABLE_ROUTE_PATHS = new Set(['/privacy']);

/** Indexable SPA paths (same set as sitemap, excluding 404 wildcard). */
export async function getIndexableRoutePaths(rootDir = process.cwd()) {
  const { routesSource, tourSlugsSource } = await loadSeoRouteSources(rootDir);
  const staticRoutes = extractStaticRoutes(routesSource).filter(
    (path) => !NON_INDEXABLE_ROUTE_PATHS.has(path),
  );
  const tourRoutes = extractTourPublicUrlsFromSlugMap(tourSlugsSource);

  return [
    ...new Set([
      ...(staticRoutes.includes('/') ? [] : ['/']),
      ...staticRoutes,
      ...tourRoutes,
    ]),
  ];
}

export async function getTourLegacyRedirectPaths(rootDir = process.cwd()) {
  const { tourSlugsSource } = await loadSeoRouteSources(rootDir);
  return extractLegacyTourRedirectUrls(tourSlugsSource);
}

export function routePathToDistFile(routePath, distDir) {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
  if (normalized === '/') {
    return resolve(distDir, 'index.html');
  }
  const segments = normalized.replace(/^\//, '').replace(/\/+$/, '').split('/');
  return resolve(distDir, ...segments, 'index.html');
}
