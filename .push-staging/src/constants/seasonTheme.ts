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

/** Вертикальное «небо» главной (под контентом после hero): пастель → интенсивный тон сезона. */
export const HOME_PAGE_SKY_BG_CLASS: Record<Season, string> = {
  winter: 'bg-home-page-sky-winter',
  spring: 'bg-home-page-sky-spring',
  summer: 'bg-home-page-sky-summer',
  fall:   'bg-home-page-sky-fall',
};

/**
 * Разделитель над заголовком «Команда» на главной: мягкий горизонтальный градиент (`tailwind.config.ts`).
 */
export const TEAM_SECTION_DIVIDER_CLASS: Record<Season, string> = {
  winter: 'bg-team-section-divider-winter',
  spring: 'bg-team-section-divider-spring',
  summer: 'bg-team-section-divider-summer',
  fall:   'bg-team-section-divider-fall',
};

/**
 * Фоновый градиент букв баннера «В другой сезон» (`background-clip: text`), по активному сезону.
 */
export const HOME_SEASON_BANNER_WORDMARK_GRADIENT_BG_CLASS: Record<Season, string> = {
  winter: 'bg-home-season-banner-wordmark-winter',
  spring: 'bg-home-season-banner-wordmark-spring',
  summer: 'bg-home-season-banner-wordmark-summer',
  fall:   'bg-home-season-banner-wordmark-fall',
};

/** Сплошной цвет букв баннера при `prefers-reduced-motion` (`colors.season.*`). */
export const HOME_SEASON_BANNER_WORDMARK_SOLID_TEXT_CLASS: Record<Season, string> = {
  winter: 'text-season-winter',
  spring: 'text-season-spring',
  summer: 'text-season-summer',
  fall:   'text-season-fall',
};
