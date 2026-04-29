/**
 * Кадрирование preface «Пидана» (`pd.preface`): вертикальный якорь при `object-cover` / `background-cover`.
 * Ниже `TOUR_SPRING_3_COVER_LAYOUT_MIN_WIDTH_PX` — узкий viewport, меньше горизонтального «зума».
 * От порога и выше — сдвиг вниз (больше % по Y), чтобы резьба на дереве оставалась у центра при широком кропе.
 * Синхронно с `min-[620px]:*` в классах hero/карточки.
 */
export const TOUR_SPRING_3_COVER_LAYOUT_MIN_WIDTH_PX = 620 as const;

/** Классы `object-position` для hero страницы тура (см. `theme.extend.objectPosition`). */
export const TOUR_SPRING_3_COVER_HERO_IMG_OBJECT_CLASS =
  'object-tour-detail-hero-spring-3-tight min-[620px]:object-tour-detail-hero-spring-3-wide lg:object-tour-detail-hero-desktop-spring-3-wide' as const;

/** Классы для обложки на карточке тура / раскрывающей плитке на главной. */
export const TOUR_SPRING_3_COVER_CARD_IMG_OBJECT_CLASS =
  'object-tour-card-cover-spring-3-tight min-[620px]:object-tour-card-cover-spring-3-wide lg:object-tour-card-cover-desktop-spring-3-wide' as const;

/** `< 620px` и базовый слой без min-width. */
export const TOUR_SPRING_3_COVER_OBJECT_POSITION_LT620 = 'center 44%' as const;
/** `≥ 620px` до `lg` (1024px). */
export const TOUR_SPRING_3_COVER_OBJECT_POSITION_GTE620 = 'center 62%' as const;
/** `lg` и шире. */
export const TOUR_SPRING_3_COVER_OBJECT_POSITION_LG = 'center 58%' as const;

export function resolveTourSpring3CoverBackgroundPosition(
  matchesMin620: boolean,
  matchesLg: boolean
): string {
  if (!matchesMin620) return TOUR_SPRING_3_COVER_OBJECT_POSITION_LT620;
  if (!matchesLg) return TOUR_SPRING_3_COVER_OBJECT_POSITION_GTE620;
  return TOUR_SPRING_3_COVER_OBJECT_POSITION_LG;
}
