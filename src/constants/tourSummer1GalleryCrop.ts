/**
 * Кадрирование медиа «Заповедная Та-Чингоуза» (summer-1) при `object-cover`.
 */
/** Hero `first.webp`: +15 п.п. по X от центра (50% → 65%). */
export const TOUR_SUMMER_1_COVER_OBJECT_POSITION = '65% 50%' as const;
/** `lg+`: тот же сдвиг по X, вертикаль как у `tour-detail-hero-desktop`. */
export const TOUR_SUMMER_1_COVER_OBJECT_POSITION_LG =
  '65% calc(51% + 100px)' as const;

export const TOUR_SUMMER_1_COVER_HERO_IMG_OBJECT_CLASS =
  'object-tour-detail-hero-summer-1-cover lg:object-tour-detail-hero-desktop-summer-1-cover' as const;

/** `tch.clip4` в вертикали bento — сдвиг вправо относительно центра на 10 п.п. */
export const TOUR_SUMMER_1_CLIP4_GRID_OBJECT_POSITION = '60% 50%' as const;

export const TOUR_SUMMER_1_CLIP4_GRID_VIDEO_OBJECT_CLASS =
  'object-gallery-summer-1-clip4-tall' as const;
