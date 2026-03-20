import type { Season } from '../types';

/** Классы фона страниц/секций по сезону (Tailwind `bg-seasonBg-*`). */
export const SEASON_PAGE_BG_CLASS: Record<Season, string> = {
  winter: 'bg-seasonBg-winter',
  spring: 'bg-seasonBg-spring',
  summer: 'bg-seasonBg-summer',
  fall:   'bg-seasonBg-fall',
};
