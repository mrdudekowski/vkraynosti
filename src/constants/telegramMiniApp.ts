import type { Season, Tour } from '../types';
import { IMAGES } from './images';
import { ROUTES } from './routes';

/** Hero каталога Mini App — сезонные баннеры главной (`IMAGES.seasonSection`). */
export const TELEGRAM_MINI_APP_HERO_BY_SEASON = IMAGES.seasonSection satisfies Record<
  Season,
  string
>;

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
