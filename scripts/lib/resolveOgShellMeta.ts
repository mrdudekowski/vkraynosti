import { findTourBySeasonAndSegment } from '../../src/data/tourLookup.ts';
import { IMAGES } from '../../src/constants/images.ts';
import { ROUTES } from '../../src/constants/routes.ts';
import { normalizeMetaContent } from '../../src/constants/metaContent.ts';
import {
  getTourPublicPath,
  isLegacyTourUrlSegment,
} from '../../src/constants/tourUrls.ts';
import {
  SEO_DEFAULTS,
  getSeasonSeoEntry,
  getTourSeoEntry,
  type RobotsDirective,
} from '../../src/constants/seo.ts';
import type { Season } from '../../src/types';
import type { TourPublicationStatus } from '../../src/types/tourSchedule';
import type { Tour } from '../../src/types/index';
import type { SiteSeoDocument } from '../../src/cms/siteSeoDocument';

export interface OgShellMeta {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  robots: RobotsDirective;
  imagePathOrUrl: string;
  keywords?: string[];
}

export type OgShellOverrides = { toursById?: ReadonlyMap<string, Tour>; siteSeo?: SiteSeoDocument | null };

const SEASON_BY_LIST_PATH: Record<string, Season> = {
  [ROUTES.WINTER]: 'winter',
  [ROUTES.SPRING]: 'spring',
  [ROUTES.SUMMER]: 'summer',
  [ROUTES.FALL]: 'fall',
};

const TOUR_DETAIL_PATH_PATTERN = /^\/tours\/(winter|spring|summer|fall)\/([^/]+)$/;

const resolveOgJpegPath = (pathOrUrl: string): string =>
  pathOrUrl.replace(/\.(?:webp|png|jpe?g)(?=$|[?#])/i, '.jpg');

export const resolveOgShellMeta = (
  routePath: string,
  tourPublicationStatus?: TourPublicationStatus,
  overrides: OgShellOverrides = {},
): OgShellMeta => {
  if (routePath === ROUTES.HOME) {
    const page = overrides.siteSeo?.pages.find((item) => item.key === 'home');
    return {
      title: normalizeMetaContent(page?.title?.trim() || SEO_DEFAULTS.home.title),
      description: normalizeMetaContent(page?.description?.trim() || SEO_DEFAULTS.home.description),
      path: SEO_DEFAULTS.home.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: IMAGES.seasonSection.summer,
      ...(page?.keywords?.length ? { keywords: page.keywords } : {}),
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
      robots: SEO_DEFAULTS.privacy.robots!,
      imagePathOrUrl: IMAGES.seasonSection.summer,
    };
  }

  const seasonKey = SEASON_BY_LIST_PATH[routePath];
  if (seasonKey != null) {
    const seoEntry = getSeasonSeoEntry(seasonKey, routePath);
    const page = overrides.siteSeo?.pages.find((item) => item.key === seasonKey);
    return {
      title: normalizeMetaContent(page?.title?.trim() || seoEntry.title),
      description: normalizeMetaContent(page?.description?.trim() || seoEntry.description),
      path: seoEntry.path,
      robots: SEO_DEFAULTS.robots,
      imagePathOrUrl: IMAGES.seasonSection[seasonKey],
      ...(page?.keywords?.length ? { keywords: page.keywords } : {}),
    };
  }

  const tourMatch = TOUR_DETAIL_PATH_PATTERN.exec(routePath);
  if (tourMatch != null) {
    const [, season, segment] = tourMatch;
    const cmsTour = [...(overrides.toursById?.values() ?? [])].find(
      (tour) =>
        tour.season === season && (tour.slug === segment || tour.id === segment),
    );
    const baseTour = cmsTour ?? findTourBySeasonAndSegment(season as Season, segment);
    if (baseTour == null) {
      throw new Error(`Unknown tour segment for OG shell: ${segment} (${routePath})`);
    }
    const tour = overrides.toursById?.get(baseTour.id) ?? baseTour;
    if (tour.season !== season) {
      throw new Error(`Tour season mismatch for OG shell: ${routePath}`);
    }
    const seoEntry = getTourSeoEntry(
      tour,
      tourPublicationStatus ? { publicationStatus: tourPublicationStatus } : undefined,
    );
    const publicPath = getTourPublicPath(tour);
    return {
      title: normalizeMetaContent(seoEntry.title),
      description: normalizeMetaContent(seoEntry.description),
      path: seoEntry.path,
      canonicalPath: isLegacyTourUrlSegment(tour, segment) ? publicPath : undefined,
      // Publication status drives index eligibility; keep the prerendered noindex for
      // in_development tours instead of overwriting it with the index,follow default.
      robots: seoEntry.robots ?? SEO_DEFAULTS.robots,
      // Keep WebP for the UI, but use prebuilt JPEG OG assets so deployment
      // does not need ffmpeg to convert images inside the build container.
      imagePathOrUrl: resolveOgJpegPath(tour.imageUrl),
      ...(seoEntry.keywords?.length ? { keywords: seoEntry.keywords } : {}),
    };
  }

  throw new Error(`No OG shell meta mapping for route: ${routePath}`);
};
