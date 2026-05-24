import type { Season } from '../types';

/** Активная точка пагинации team-hero (сезонные цвета, как в hero). */
export const TEAM_HERO_PAGINATION_ACTIVE_DOT_CLASS: Record<Season, string> = {
  winter: 'bg-season-winter',
  spring: 'bg-season-spring',
  summer: 'bg-season-summer',
  fall: 'bg-season-fall',
};

export const TEAM_HERO_PAGINATION_INACTIVE_DOT_HOVER_CLASS: Record<Season, string> = {
  winter: 'hover:bg-season-winter/80',
  spring: 'hover:bg-season-spring/80',
  summer: 'hover:bg-season-summer/80',
  fall: 'hover:bg-season-fall/80',
};
