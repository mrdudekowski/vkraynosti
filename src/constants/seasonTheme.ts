import type { Season } from '../types';

/** Линейный пастельный фон страницы (`bg-season-page-*` в `tailwind.config.ts`). */
export const SEASON_PAGE_BG_CLASS: Record<Season, string> = {
  winter: 'bg-season-page-winter',
  spring: 'bg-season-page-spring',
  summer: 'bg-season-page-summer',
  fall:   'bg-season-page-fall',
};

/** Радиальный слой для размытия в `SeasonPageBackdrop` (`bg-season-page-atmosphere-*`). */
export const SEASON_PAGE_ATMOSPHERE_BG_CLASS: Record<Season, string> = {
  winter: 'bg-season-page-atmosphere-winter',
  spring: 'bg-season-page-atmosphere-spring',
  summer: 'bg-season-page-atmosphere-summer',
  fall:   'bg-season-page-atmosphere-fall',
};
