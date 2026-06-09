import { CONTACTS, SITE_URL } from './contacts';
import { IMAGES } from './images';
import { resolveMediaAssetUrl } from './publicAssetBase';
import { ROUTES, buildTourDetailPath } from './routes';
import type { Season, Tour } from '../types';
import { UI } from './ui';
import {
  hasCustomTourDifficultyLabel,
  resolveTourDifficultyLabel,
} from '../utils/tourDifficultyLabel';
import type { TourPublicationStatus } from '../types/tourSchedule';

export type RobotsDirective = 'index,follow' | 'noindex,nofollow' | 'noindex,follow';

export interface SeoEntry {
  title: string;
  description: string;
  path: string;
  robots?: RobotsDirective;
}

const SITE_NAME = 'Вкрайности' as const;
const TWITTER_CARD_TYPE = 'summary_large_image' as const;

export const getCanonicalUrl = (path: string): string => `${SITE_URL}${path}`;

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
  // SITE_URL already ends with /vkraynosti; media paths include APP base — avoid doubling.
  if (assetPath.startsWith('/vkraynosti/') && origin.endsWith('/vkraynosti')) {
    assetPath = assetPath.slice('/vkraynosti'.length) || '/';
  }
  return `${origin}${assetPath}`;
};

const SEASON_META_BY_KEY: Record<Season, Omit<SeoEntry, 'path'>> = {
  winter: {
    title: 'Зимние поездки Приморья — сопки и море | Вкрайности',
    description:
      'Зима из Владивостока: снежные сопки, ледяное побережье и уютные выезды по Приморью. Маршруты для разного уровня подготовки с опытными гидами.',
  },
  spring: {
    title: 'Весенние поездки Приморья — Пидан, Сестра, Аскольд | Вкрайности',
    description:
      'Весна из Владивостока: Лысый Дед, Пидан, Сестра, Аскольд, Шкота, Гамова и другие маршруты Приморья. От лёгких однодневных до многодневных походов.',
  },
  summer: {
    title: 'Летние поездки Приморья — заповедное побережье | Вкрайности',
    description:
      'Лето из Владивостока: Тачингоуза, Краббе, Пляж Трёх границ, Ежовая, Сестра, Неожиданный, Аскольд, Шкота, Гамова и другие маршруты Приморья.',
  },
  fall: {
    title: 'Осенние поездки Приморья — те же маршруты, что весной | Вкрайности',
    description:
      'Осень из Владивостока: Лысый Дед, Пидан, Сестра, Аскольд, Шкота, Гамова и другие весенние маршруты — в осеннем каталоге с отдельными обложками.',
  },
};

export const SEO_DEFAULTS = {
  siteName: SITE_NAME,
  twitterCard: TWITTER_CARD_TYPE,
  robots: 'index,follow' as RobotsDirective,
  home: {
    title: 'Вкрайности — Поездки по Приморью из Владивостока',
    description:
      'Авторские поездки по Приморью: заповедное побережье, сопки и море. Зима, весна, лето и осень — четыре сезона маршрутов из Владивостока с опытными гидами.',
    path: ROUTES.HOME,
  } satisfies SeoEntry,
  safety: {
    title: 'Безопасность в наших походах | Вкрайности',
    description:
      'Как мы обеспечиваем безопасность: профессиональное снаряжение, GPS-навигация, врач в каждой группе, спутниковая связь и план эвакуации.',
    path: ROUTES.SAFETY,
  } satisfies SeoEntry,
  privacy: {
    title: UI.privacyPage.metaTitle,
    description: UI.privacyPage.metaDescription,
    path: ROUTES.PRIVACY,
  } satisfies SeoEntry,
  notFound: {
    title: UI.notFoundPage.metaTitle,
    description: UI.notFoundPage.description,
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

export const getTourSeoEntry = (
  tour: Tour,
  options?: TourSeoDurationOptions
): SeoEntry => {
  const publicationStatus = options?.publicationStatus ?? 'active';
  const metaSnippet =
    publicationStatus === 'in_development'
    ? UI.tourDetail.programInDevelopment
    : tour.program
        .slice(0, 3)
        .map(step => step.description)
        .join(', ');

  const seasonLabel = UI.seasons[tour.season].label;
  const durationSnippet = options?.displayDuration?.trim();
  const durationPart =
    durationSnippet != null && durationSnippet.length > 0
      ? `${durationSnippet}, `
      : '';

  return {
    title: `${tour.title} — ${seasonLabel} | ${SITE_NAME}`,
    description: `${seasonLabel}: ${tour.subtitle}. ${durationPart}${tour.price}. ${metaSnippet}.`,
    path: buildTourDetailPath(tour.season, tour.id),
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
  const tourPath = buildTourDetailPath(tour.season, tour.id);

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
  options?: TourSeoDurationOptions
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
