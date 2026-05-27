/**
 * Z-index и overlay-классы hero страницы тура (локальный стек внутри `relative` контейнера).
 * Числа → `theme.extend.zIndex` в `tailwind.config.ts`.
 */

export const TOUR_DETAIL_HERO_GRADIENT_Z_INDEX = 20 as const;
export const TOUR_DETAIL_HERO_CAPTION_Z_INDEX = 30 as const;

export const TOUR_DETAIL_HERO_GRADIENT_OVERLAY_CLASS =
  'absolute inset-0 z-tour-detail-hero-gradient bg-gradient-to-t from-black/70 to-transparent pointer-events-none' as const;

export const TOUR_DETAIL_HERO_CAPTION_SHELL_CLASS =
  'absolute bottom-0 left-0 right-0 z-tour-detail-hero-caption tour-detail-page-gutter py-tour-detail-hero-overlay-y' as const;
