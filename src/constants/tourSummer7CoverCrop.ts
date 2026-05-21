/**
 * Кадрирование hero «Северное Приморье» (summer-7), `bazi.webp` — маяк Балюзек.
 */
/** Hero: якорь выше центра, чтобы маяк оказался в середине кадра. */
export const TOUR_SUMMER_7_COVER_OBJECT_POSITION = 'center 32%' as const;
/** `lg+`: якорь ниже, чем на мобиле — маяк не уезжает вверх в широком hero. */
export const TOUR_SUMMER_7_COVER_OBJECT_POSITION_LG = 'center 24%' as const;

export const TOUR_SUMMER_7_COVER_HERO_IMG_OBJECT_CLASS =
  'object-tour-detail-hero-summer-7-cover lg:object-tour-detail-hero-desktop-summer-7-cover' as const;
