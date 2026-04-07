import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSnowflake, faSeedling, faSun, faLeaf } from '@fortawesome/free-solid-svg-icons';
import type { Season } from '../types';

/**
 * Подписи сезона (navbar, dock): мягкий градиент + `bg-clip-text`;
 * при `prefers-reduced-motion` — сплошной `text-season-*`.
 */
export const SEASON_TEXT_CLASS: Record<Season, string> = {
  winter:
    'bg-season-chrome-text-winter bg-clip-text text-transparent motion-reduce:bg-none motion-reduce:text-season-winter',
  spring:
    'bg-season-chrome-text-spring bg-clip-text text-transparent motion-reduce:bg-none motion-reduce:text-season-spring',
  summer:
    'bg-season-chrome-text-summer bg-clip-text text-transparent motion-reduce:bg-none motion-reduce:text-season-summer',
  fall:
    'bg-season-chrome-text-fall bg-clip-text text-transparent motion-reduce:bg-none motion-reduce:text-season-fall',
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
    /** Лёгкое свечение при hover круга под баннером (`SeasonSwitcher` variant section). */
    sectionHoverGlow: string;
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
    sectionHoverGlow: 'group-hover:shadow-season-strip-hover-winter',
    shimmer: 'via-season-winter/20',
    iconColor: 'text-season-winter drop-shadow-season-chrome-icon-winter',
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
    sectionHoverGlow: 'group-hover:shadow-season-strip-hover-spring',
    shimmer: 'via-season-spring/20',
    iconColor: 'text-season-spring drop-shadow-season-chrome-icon-spring',
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
    sectionHoverGlow: 'group-hover:shadow-season-strip-hover-summer',
    shimmer: 'via-season-summer/20',
    iconColor: 'text-season-summer drop-shadow-season-chrome-icon-summer',
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
    sectionHoverGlow: 'group-hover:shadow-season-strip-hover-fall',
    shimmer: 'via-season-fall/20',
    iconColor: 'text-season-fall drop-shadow-season-chrome-icon-fall',
    activeRing: 'ring-2 ring-season-fall/50',
    rotate: 'group-hover:rotate-2',
    hoverUnderline: 'group-hover:border-season-fall',
    activeUnderline: 'border-season-fall',
  },
};

export const SEASON_ORDER: Season[] = ['winter', 'spring', 'summer', 'fall'];
