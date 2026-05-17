import { CONTACTS, SITE_URL } from './contacts';
import { ROUTES, buildTourDetailPath } from './routes';
import type { Season, Tour } from '../types';
import { UI } from './ui';

export type RobotsDirective = 'index,follow' | 'noindex,nofollow' | 'noindex,follow';

export interface SeoEntry {
  title: string;
  description: string;
  path: string;
  robots?: RobotsDirective;
}

const SITE_NAME = 'Вкрайности' as const;
const TWITTER_CARD_TYPE = 'summary_large_image' as const;

const SEASON_META_BY_KEY: Record<Season, Omit<SeoEntry, 'path'>> = {
  winter: {
    title: 'Зимние туры — Байкал, Хибины, Алтай | Вкрайности',
    description:
      'Зимние приключения в России: ледяные пещеры Байкала, фрирайд в Хибинах, экспедиции по Алтаю. Маршруты для любого уровня подготовки.',
  },
  spring: {
    title: 'Весенние туры — Алтай, Камчатка, Байкал | Вкрайности',
    description:
      'Весна в России: цветение маральника на Алтае, вулканы Камчатки и Байкал. Маршруты на любой уровень от лёгких до сложных.',
  },
  summer: {
    title: 'Летние туры Приморья — заповедное побережье | Вкрайности',
    description:
      'Лето из Владивостока: Тачингоуза, Тобизина, Аскольд, Шкота и полуостров Гамова — те же маршруты, что в весеннем каталоге, в летнем сезоне.',
  },
  fall: {
    title: 'Осенние туры — Алтай, Карелия, Кавказ | Вкрайности',
    description:
      'Осень в России: золото лиственниц Алтая, леса Карелии и горные сёла Кавказа. Живописное время года для походов.',
  },
};

export const SEO_DEFAULTS = {
  siteName: SITE_NAME,
  twitterCard: TWITTER_CARD_TYPE,
  robots: 'index,follow' as RobotsDirective,
  home: {
    title: 'Вкрайности — Туры по дикой природе России',
    description:
      'Авторские туры по Алтаю, Байкалу, Камчатке и Кавказу. Зима, весна, лето и осень — четыре сезона приключений с опытными гидами.',
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
} as const;

export const getSeasonSeoEntry = (season: Season, path: string): SeoEntry => ({
  ...SEASON_META_BY_KEY[season],
  path,
});

export const getTourSeoEntry = (tour: Tour): SeoEntry => {
  const metaSnippet = tour.program
    .slice(0, 3)
    .map(step => step.description)
    .join(', ');

  return {
    title: `${tour.title} | ${SITE_NAME}`,
    description: `${tour.subtitle}. ${tour.duration}, ${tour.price}. ${metaSnippet}.`,
    path: buildTourDetailPath(tour.season, tour.id),
  };
};

export const getCanonicalUrl = (path: string): string => `${SITE_URL}${path}`;

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  email: CONTACTS.EMAIL,
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

export const getTourStructuredData = (tour: Tour) => {
  const seoEntry = getTourSeoEntry(tour);

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: seoEntry.description,
    url: getCanonicalUrl(seoEntry.path),
    image: tour.imageUrl,
    itinerary: tour.program.map(step => step.description),
    provider: {
      '@type': 'Organization',
      name: SEO_DEFAULTS.siteName,
      url: SITE_URL,
    },
    touristType:
      tour.metaAudienceLabel ??
      tour.difficultyDisplayLabel ??
      'Для взрослых путешественников',
  } as const;
};
