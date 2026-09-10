import { TOURS } from '../data/toursData';
import {
  getLegacyTourPath,
  getTourPublicPath,
  tourHasPublicSlug,
} from './tourUrls';

/** Strip trailing slash for dist path mapping and sitemap loc assembly. */
export const stripRouteTrailingSlash = (path: string): string => {
  if (path === '/') {
    return '/';
  }
  return path.replace(/\/+$/, '');
};

/** Indexable public tour paths (slug when set, otherwise id). */
export function getTourPublicSeoPaths(): string[] {
  return TOURS.map((tour) => stripRouteTrailingSlash(getTourPublicPath(tour)));
}

/** Legacy id paths that redirect to slug URLs (only tours with explicit slug). */
export function getTourLegacyRedirectPaths(): string[] {
  return TOURS.filter(tourHasPublicSlug).map((tour) =>
    stripRouteTrailingSlash(getLegacyTourPath(tour)),
  );
}
