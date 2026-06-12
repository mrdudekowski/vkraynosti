import { CONTACTS, SITE_URL } from './contacts';
import { buildCanonicalUrl } from './canonicalUrl';
import { IMAGES } from './images';
import { resolveMediaAssetUrl } from './publicAssetBase';
import { ROUTES } from './routes';
import { getTourPublicPath } from './tourUrls';
import { TOUR_SEO_DESCRIPTION_BY_ID } from '../data/tourSeoDescriptions';
import type { Season, Tour } from '../types';
import { UI } from './ui';
import {
  hasCustomTourDifficultyLabel,
  resolveTourDifficultyLabel,
} from '../utils/tourDifficultyLabel';
import type { TourPublicationStatus } from '../types/tourSchedule';
import { finalizeMetaDescription } from './metaContent';

export type RobotsDirective = 'index,follow' | 'noindex,nofollow' | 'noindex,follow';

export interface SeoEntry {
  title: string;
  description: string;
  path: string;
  robots?: RobotsDirective;
}

const SITE_NAME = 'Вкрайности' as const;
const TWITTER_CARD_TYPE = 'summary_large_image' as const;

const finalizeSeoFields = (entry: Omit<SeoEntry, 'path'>): Omit<SeoEntry, 'path'> => ({
  ...entry,
  description: finalizeMetaDescription(entry.description),
});

export const getCanonicalUrl = (path: string): string => buildCanonicalUrl(SITE_URL, path);

/** Logical path under `public/` for OG shell assets (no CDN origin). */
export const resolveOgShellLogicalImagePath = (pathOrUrl: string): string => {
  let pathname: string;
  if (/^https?:\/\//i.test(pathOrUrl)) {
    pathname = new URL(pathOrUrl).pathname;
  } else {
    pathname = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  }
  let logical = pathname.replace(/^\/+/, '');
  if (logical.startsWith('vkraynosti/')) {
    logical = logical.slice('vkraynosti/'.length);
  }
  return logical;
};

/** OG shell previews: App origin only — CDN objects carry X-Robots-Tag on TimeWeb. */
export const getOgShellAbsoluteImageUrl = (pathOrUrl: string): string => {
  const logical = resolveOgShellLogicalImagePath(pathOrUrl);
  const origin = SITE_URL.replace(/\/+$/, '');
  return `${origin}/${logical}`;
};

/** Absolute HTTPS URL for Open Graph / Twitter (social crawlers require full URL). */
export const getAbsoluteOgImageUrl = (pathOrUrl: string): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  const resolved = resolveMediaAssetUrl(pathOrUrl);
  if (/^https?:\/\//i.test(resolved)) {
    return resolved;
  }
  const origin = SITE_URL.replace(/\/+$/, '');
  let assetPath = resolved.startsWith('/') ? resolved : `/${resolved}`;
  if (assetPath.startsWith('/vkraynosti/') && origin.endsWith('/vkraynosti')) {
    assetPath = assetPath.slice('/vkraynosti'.length) || '/';
  }
  return `${origin}${assetPath}`;
};

const SEASON_META_BY_KEY: Record<Season, Omit<SeoEntry, 'path'>> = {
  winter: finalizeSeoFields({
    title: 'Зимние поездки Приморья — сопки и море | Вкрайности',
    description:
      'Зимние выезды из Владивостока: сопки, ледяное море и маршруты разной сложности с гидами и снаряжением.',
  }),
  spring: finalizeSeoFields({
    title: 'Весенние поездки Приморья — Пидан, Сестра, Аскольд | Вкрайности',
    description:
      'Весенние поездки из Владивостока: Пидан, Сестра, Аскольд, Шкота, Гамова и другие маршруты Приморья.',
  }),
  summer: finalizeSeoFields({
    title: 'Летние поездки Приморья — заповедное побережье | Вкрайности',
    description:
      'Летние поездки из Владивостока: заповедное побережье, бухты, острова и морские маршруты Приморья.',
  }),
  fall: finalizeSeoFields({
    title: 'Осенние поездки Приморья — те же маршруты, что весной | Вкрайности',
    description:
      'Осенние маршруты из Владивостока: весенние треки в осенних красках, с отдельными обложками туров.',
  }),
};

export const SEO_DEFAULTS = {
  siteName: SITE_NAME,
  twitterCard: TWITTER_CARD_TYPE,
  robots: 'index,follow' as RobotsDirective,
  home: {
    ...finalizeSeoFields({
      title: 'Вкрайности — Поездки по Приморью из Владивостока',
      description:
        'Поездки по Приморью из Владивостока: сопки, море и заповедные маршруты. Четыре сезона выездов с гидами.',
    }),
    path: ROUTES.HOME,
  } satisfies SeoEntry,
  safety: {
    ...finalizeSeoFields({
      title: 'Правила безопасности и участия | Вкрайности',
      description:
        'Правила безопасности «ВКрайности»: риски маршрута, обязанности участника и ответственность.',
    }),
    path: ROUTES.SAFETY,
  } satisfies SeoEntry,
  privacy: {
    ...finalizeSeoFields({
      title: UI.privacyPage.metaTitle,
      description: UI.privacyPage.metaDescription,
    }),
    path: ROUTES.PRIVACY,
    robots: 'noindex,nofollow' as RobotsDirective,
  } satisfies SeoEntry,
  notFound: {
    ...finalizeSeoFields({
      title: UI.notFoundPage.metaTitle,
      description: UI.notFoundPage.description,
    }),
    path: ROUTES.HOME,
    robots: 'noindex,nofollow' as RobotsDirective,
  } satisfies SeoEntry,
  defaultOgImage: getAbsoluteOgImageUrl(IMAGES.seasonSection.summer),
} as const;

export const getSeasonSeoEntry = (season: Season, path: string): SeoEntry => ({
  ...SEASON_META_BY_KEY[season],
  path,
});

export interface TourSeoDurationOptions {
  displayDuration?: string;
  publicationStatus?: TourPublicationStatus;
}

const buildTourSeoDescriptionDraft = (
  tour: Tour,
  publicationStatus: TourPublicationStatus,
): string => {
  const explicit =
    tour.seoDescription?.trim() ?? TOUR_SEO_DESCRIPTION_BY_ID[tour.id]?.trim();
  if (explicit != null && explicit.length > 0) {
    return explicit;
  }

  if (publicationStatus === 'in_development') {
    return UI.tourDetail.programInDevelopment;
  }

  const seasonLabel = UI.seasons[tour.season].label;
  const pricePart = tour.price.trim();
  const core = pricePart.length > 0
    ? `${seasonLabel}: ${tour.subtitle}. ${pricePart}.`
    : `${seasonLabel}: ${tour.subtitle}.`;

  return core;
};

export const getTourSeoEntry = (
  tour: Tour,
  options?: TourSeoDurationOptions,
): SeoEntry => {
  const publicationStatus = options?.publicationStatus ?? 'active';
  const description = finalizeMetaDescription(
    buildTourSeoDescriptionDraft(tour, publicationStatus),
  );

  return {
    title: `${tour.title} — ${UI.seasons[tour.season].label} | ${SITE_NAME}`,
    description,
    path: getTourPublicPath(tour),
  };
};

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  email: CONTACTS.PERSONAL_DATA_EMAIL,
  sameAs: [CONTACTS.TELEGRAM_HREF, CONTACTS.MAX_HREF],
} as const;

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'ru-RU',
} as const;

export const getTourBreadcrumbSchema = (tour: Tour) => {
  const season = UI.seasons[tour.season];
  const seasonPath = `/tours/${tour.season}`;
  const tourPath = getTourPublicPath(tour);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: UI.breadcrumbs.home,
        item: getCanonicalUrl(ROUTES.HOME),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${season.emoji} ${season.label}`,
        item: getCanonicalUrl(seasonPath),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tour.title,
        item: getCanonicalUrl(tourPath),
      },
    ],
  } as const;
};

export const getTourStructuredData = (
  tour: Tour,
  options?: TourSeoDurationOptions,
) => {
  const seoEntry = getTourSeoEntry(tour, options);

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: seoEntry.description,
    url: getCanonicalUrl(seoEntry.path),
    image: getAbsoluteOgImageUrl(tour.imageUrl),
    itinerary: tour.program.map(step => step.description),
    provider: {
      '@type': 'Organization',
      name: SEO_DEFAULTS.siteName,
      url: SITE_URL,
    },
    touristType:
      tour.metaAudienceLabel ??
      (hasCustomTourDifficultyLabel(tour)
        ? resolveTourDifficultyLabel(tour)
        : 'Для взрослых путешественников'),
  } as const;
};
