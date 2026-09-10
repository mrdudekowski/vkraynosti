import type { Season, Tour } from '../types';
import { MEDIA_ASSET_BASE } from './publicAssetBase';
import { ROUTES } from './routes';

/** Hero каталога Mini App — `public/telegram/hero/{season}.webp` → S3/CDN. */
const TELEGRAM_MINI_APP_HERO_BASE = `${MEDIA_ASSET_BASE}telegram/hero` as const;

export const TELEGRAM_MINI_APP_HERO_BY_SEASON = {
  winter: `${TELEGRAM_MINI_APP_HERO_BASE}/winter.webp`,
  spring: `${TELEGRAM_MINI_APP_HERO_BASE}/spring.webp`,
  summer: `${TELEGRAM_MINI_APP_HERO_BASE}/summer.webp`,
  fall: `${TELEGRAM_MINI_APP_HERO_BASE}/fall.webp`,
} satisfies Record<Season, string>;

export const getTelegramMiniAppHeroImage = (season: Season): string =>
  TELEGRAM_MINI_APP_HERO_BY_SEASON[season];

export const TELEGRAM_MINI_APP_SOURCE = 'telegram-mini-app' as const;

export const TELEGRAM_TOUR_DESCRIPTION_MAX_LENGTH = 420;

export const buildTelegramTourPath = (
  tour: Pick<Tour, 'season' | 'id' | 'slug'>,
): string => `${ROUTES.TELEGRAM}/tour/${tour.season}/${tour.slug ?? tour.id}`;

export const buildTelegramRequestPath = (
  tour: Pick<Tour, 'season' | 'id' | 'slug'>,
): string => `${buildTelegramTourPath(tour)}/request`;

export const buildTelegramSeasonCatalogPath = (season: Season): string =>
  `${ROUTES.TELEGRAM}?season=${season}`;

export const parseTelegramSeasonSearchParam = (
  value: string | null,
): Season | null => {
  if (value === 'winter' || value === 'spring' || value === 'summer' || value === 'fall') {
    return value;
  }
  return null;
};
