import { getTourById } from '../../src/data/toursData.ts';
import { IMAGES } from '../../src/constants/images.ts';
import { ROUTES } from '../../src/constants/routes.ts';
import { normalizeMetaContent } from '../../src/constants/metaContent.ts';
import {
  SEO_DEFAULTS,
  getSeasonSeoEntry,
  getTourSeoEntry,
  type RobotsDirective,
} from '../../src/constants/seo.ts';
import type { Season } from '../../src/types';

export interface OgShellMeta {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  robots: RobotsDirective;
  imagePathOrUrl: string;
}

const SEASON_BY_LIST_PATH: Record<string, Season> = {
  [ROUTES.WINTER]: 'winter',
  [ROUTES.SPRING]: 'spring',
  [ROUTES.SUMMER]: 'summer',
  [ROUTES.FALL]: 'fall',
};

const TOUR_DETAIL_PATH_PATTERN = /^\/tours\/(winter|spring|summer|fall)\/([^/]+)$/;

export const resolveOgShellMeta = (routePath: string): OgShellMeta => {
  if (routePath === ROUTES.HOME) {
    return {
      title: normalizeMetaContent(SEO_DEFAULTS.home.title),
      description: normalizeMetaContent(SEO_DEFAULTS.home.description),
      path: SEO_DEFAULTS.home.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: IMAGES.seasonSection.summer,
    };
  }

  if (routePath === ROUTES.SAFETY) {
    return {
      title: normalizeMetaContent(SEO_DEFAULTS.safety.title),
      description: normalizeMetaContent(SEO_DEFAULTS.safety.description),
      path: SEO_DEFAULTS.safety.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: IMAGES.seasonSection.summer,
    };
  }

  if (routePath === ROUTES.PRIVACY) {
    return {
      title: normalizeMetaContent(SEO_DEFAULTS.privacy.title),
      description: normalizeMetaContent(SEO_DEFAULTS.privacy.description),
      path: SEO_DEFAULTS.privacy.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: IMAGES.seasonSection.summer,
    };
  }

  const seasonKey = SEASON_BY_LIST_PATH[routePath];
  if (seasonKey != null) {
    const seoEntry = getSeasonSeoEntry(seasonKey, routePath);
    return {
      title: normalizeMetaContent(seoEntry.title),
      description: normalizeMetaContent(seoEntry.description),
      path: seoEntry.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: IMAGES.seasonSection[seasonKey],
    };
  }

  const tourMatch = TOUR_DETAIL_PATH_PATTERN.exec(routePath);
  if (tourMatch != null) {
    const [, season, tourId] = tourMatch;
    const tour = getTourById(tourId);
    if (tour == null) {
      throw new Error(`Unknown tour id for OG shell: ${tourId} (${routePath})`);
    }
    if (tour.season !== season) {
      throw new Error(`Tour season mismatch for OG shell: ${routePath}`);
    }
    const seoEntry = getTourSeoEntry(tour);
    return {
      title: normalizeMetaContent(seoEntry.title),
      description: normalizeMetaContent(seoEntry.description),
      path: seoEntry.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: tour.imageUrl,
    };
  }

  throw new Error(`No OG shell meta mapping for route: ${routePath}`);
};
