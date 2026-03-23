import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSnowflake, faSeedling, faSun, faLeaf } from '@fortawesome/free-solid-svg-icons';
import type { Season } from '../types';

/** Классы цвета подписи сезона (navbar, dock). */
export const SEASON_TEXT_CLASS: Record<Season, string> = {
  winter: 'text-season-winter',
  spring: 'text-season-spring',
  summer: 'text-season-summer',
  fall:   'text-season-fall',
};

// TODO: Replace these placeholder FA icons with more expressive season SVGs or
//       a custom icon set that better captures the mood of each season.
export const SEASON_ICON: Record<Season, IconDefinition> = {
  winter: faSnowflake,
  spring: faSeedling,
  summer: faSun,
  fall:   faLeaf,
};

/** Статические классы Tailwind — полные строки для JIT. */
export const SEASON_STYLE: Record<
  Season,
  {
    border: string;
    hoverShadow: string;
    activeShadow: string;
    hoverBorder: string;
    hoverFrom: string;
    shimmer: string;
    iconColor: string;
    activeRing: string;
    rotate: string;
    hoverUnderline: string;
    activeUnderline: string;
  }
> = {
  winter: {
    border: 'border-season-winter/20',
    hoverShadow: 'group-hover:shadow-season-winter/30',
    activeShadow: 'shadow-season-winter/40',
    hoverBorder: 'group-hover:border-season-winter/50',
    hoverFrom: 'group-hover:from-season-winter/10',
    shimmer: 'via-season-winter/20',
    iconColor: 'text-season-winter',
    activeRing: 'ring-2 ring-season-winter/50',
    rotate: 'group-hover:rotate-3',
    hoverUnderline: 'group-hover:border-season-winter',
    activeUnderline: 'border-season-winter',
  },
  spring: {
    border: 'border-season-spring/20',
    hoverShadow: 'group-hover:shadow-season-spring/30',
    activeShadow: 'shadow-season-spring/40',
    hoverBorder: 'group-hover:border-season-spring/50',
    hoverFrom: 'group-hover:from-season-spring/10',
    shimmer: 'via-season-spring/20',
    iconColor: 'text-season-spring',
    activeRing: 'ring-2 ring-season-spring/50',
    rotate: 'group-hover:rotate-2',
    hoverUnderline: 'group-hover:border-season-spring',
    activeUnderline: 'border-season-spring',
  },
  summer: {
    border: 'border-season-summer/20',
    hoverShadow: 'group-hover:shadow-season-summer/30',
    activeShadow: 'shadow-season-summer/40',
    hoverBorder: 'group-hover:border-season-summer/50',
    hoverFrom: 'group-hover:from-season-summer/10',
    shimmer: 'via-season-summer/20',
    iconColor: 'text-season-summer',
    activeRing: 'ring-2 ring-season-summer/50',
    rotate: 'group-hover:-rotate-2',
    hoverUnderline: 'group-hover:border-season-summer',
    activeUnderline: 'border-season-summer',
  },
  fall: {
    border: 'border-season-fall/20',
    hoverShadow: 'group-hover:shadow-season-fall/30',
    activeShadow: 'shadow-season-fall/40',
    hoverBorder: 'group-hover:border-season-fall/50',
    hoverFrom: 'group-hover:from-season-fall/10',
    shimmer: 'via-season-fall/20',
    iconColor: 'text-season-fall',
    activeRing: 'ring-2 ring-season-fall/50',
    rotate: 'group-hover:rotate-2',
    hoverUnderline: 'group-hover:border-season-fall',
    activeUnderline: 'border-season-fall',
  },
};

export const SEASON_ORDER: Season[] = ['winter', 'spring', 'summer', 'fall'];
