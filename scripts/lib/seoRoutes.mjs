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
export const NON_INDEXABLE_ROUTE_PATHS = new Set(['/privacy', '/safety']);

/** Telegram Mini App — CSR-only; no data-SSG, OG shells, or sitemap. */
export const NON_SEO_ROUTE_PREFIX = '/telegram';

export function isSeoRoutePath(routePath) {
  return !routePath.startsWith(NON_SEO_ROUTE_PREFIX);
}

/** Static indexable SPA paths (no tour detail pages), always including `/`. */
export function getStaticIndexableRoutePaths(routesSource) {
  const staticRoutes = extractStaticRoutes(routesSource).filter(
    (path) => !NON_INDEXABLE_ROUTE_PATHS.has(path) && isSeoRoutePath(path),
  );
  return [...new Set([...(staticRoutes.includes('/') ? [] : ['/']), ...staticRoutes])];
}

/** Fallback when `public/data/tour-schedule/` is gitignored locally / before `sync:catalog`. */
import { readTourCatalogFile } from './readTourCatalogFile.mjs';

/**
 * Published tour catalog (`public/data/tour-schedule/tours_list.json`): tour id →
 * publication status. Only `active` + `in_development` are present; `hidden` tours
 * are dropped by `generate-tour-data-fixtures.mjs`, so they are simply absent here.
 */
async function loadPublishedTourStatusById(rootDir) {
  let parsed;
  try {
    parsed = JSON.parse(await readTourCatalogFile(rootDir, 'tours_list.json'));
  } catch (cause) {
    throw new Error(
      `Tour catalog not readable — run \`npm run sync:catalog\` first`,
      { cause },
    );
  }
  const statusById = new Map();
  for (const tour of parsed.tours ?? []) {
    if (tour?.id && tour.publicationStatus) {
      statusById.set(tour.id, tour.publicationStatus);
    }
  }
  return statusById;
}

/**
 * routePath → publication status (`active` | `in_development`) for tours that have a
 * public slug AND appear in the catalog. Hidden tours (absent from catalog) are omitted,
 * so they never reach sitemap, prerender or OG shells.
 */
export async function getTourStatusByPublicPath(rootDir = process.cwd()) {
  const { tourSlugsSource } = await loadSeoRouteSources(rootDir);
  const slugMap = parseTourSlugMap(tourSlugsSource);
  const statusById = await loadPublishedTourStatusById(rootDir);

  const statusByPath = new Map();
  for (const [tourId, slug] of slugMap) {
    const status = statusById.get(tourId);
    if (status) {
      statusByPath.set(`/tours/${seasonFromTourId(tourId)}/${slug}`, status);
    }
  }
  return statusByPath;
}

/**
 * Sitemap = index-eligible URLs: static indexable routes + ONLY `active` tours.
 * `in_development` (noindex) and `hidden` tours are excluded.
 */
export async function getSitemapRoutePaths(rootDir = process.cwd()) {
  const { routesSource } = await loadSeoRouteSources(rootDir);
  const statusByPath = await getTourStatusByPublicPath(rootDir);
  const activeTourPaths = [...statusByPath.entries()]
    .filter(([, status]) => status === 'active')
    .map(([path]) => path);

  return [...new Set([...getStaticIndexableRoutePaths(routesSource), ...activeTourPaths])];
}

/**
 * Rendered public routes for prerender / OG shells / verify: static indexable routes +
 * `active` + `in_development` tours (both render real content with `tour-detail-main`).
 * Hidden tours are excluded — they render not-found at runtime and would time out the
 * prerender content gate.
 */
export async function getRenderableRoutePaths(rootDir = process.cwd()) {
  const { routesSource } = await loadSeoRouteSources(rootDir);
  const statusByPath = await getTourStatusByPublicPath(rootDir);
  return [
    ...new Set([...getStaticIndexableRoutePaths(routesSource), ...statusByPath.keys()]),
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

/**
 * Validate the route-set contracts shared by the catalog, Sitemap, generated output,
 * and internal links. This function is intentionally pure so CI and unit tests use
 * exactly the same rules.
 */
export function auditSeoRouteIntegrity({
  activePaths = [],
  hiddenPaths = [],
  inDevelopmentPaths = [],
  sitemapPaths = [],
  renderablePaths = [],
  legacyRedirectPaths = [],
  legacyGeneratedPaths = legacyRedirectPaths,
  legacyHttpRedirectPaths = legacyRedirectPaths,
  internalLinks = [],
}) {
  const active = new Set(activePaths);
  const hidden = new Set(hiddenPaths);
  const inDevelopment = new Set(inDevelopmentPaths);
  const sitemap = new Set(sitemapPaths);
  const renderable = new Set(renderablePaths);
  const legacy = new Set(legacyRedirectPaths);
  const legacyGenerated = new Set(legacyGeneratedPaths);
  const legacyHttpRedirects = new Set(legacyHttpRedirectPaths);
  const knownRoutes = new Set([
    ...active,
    ...hidden,
    ...inDevelopment,
    ...sitemap,
    ...renderable,
    ...legacy,
  ]);
  const violations = [];
  const add = (code, path, detail) => violations.push({ code, path, detail });

  for (const path of active) {
    if (!sitemap.has(path)) {
      add('active_not_in_sitemap', path, 'active route is missing from Sitemap');
    }
    if (!renderable.has(path)) {
      add('active_not_renderable', path, 'active route is missing from generated output');
    }
  }

  for (const path of hidden) {
    if (sitemap.has(path)) {
      add('hidden_in_sitemap', path, 'hidden route must not be in Sitemap');
    }
  }

  for (const path of inDevelopment) {
    if (sitemap.has(path)) {
      add('in_development_in_sitemap', path, 'in-development route must not be in Sitemap');
    }
    if (!renderable.has(path)) {
      add(
        'in_development_not_renderable',
        path,
        'in-development route must exist in generated output for a noindex page',
      );
    }
  }

  for (const path of sitemap) {
    if (!renderable.has(path)) {
      add('sitemap_not_renderable', path, 'Sitemap route is missing from generated output');
    }
  }

  for (const path of legacy) {
    if (!legacyGenerated.has(path)) {
      add('legacy_redirect_not_generated', path, 'legacy route has no generated redirect shell');
    }
    if (!legacyHttpRedirects.has(path)) {
      add('legacy_http_redirect_not_generated', path, 'legacy route has no generated HTTP 301 rule');
    }
  }

  for (const link of internalLinks) {
    const from = link?.from ?? '';
    const to = link?.to ?? '';
    if (hidden.has(to)) {
      add('hidden_internal_link', to, `${from} links to a hidden route`);
    } else if (legacy.has(to)) {
      add('legacy_internal_link', to, `${from} links to a legacy redirect route`);
    } else if (!knownRoutes.has(to)) {
      add('unknown_internal_link', to, `${from} links to an unknown route`);
    }
  }

  return { violations };
}
