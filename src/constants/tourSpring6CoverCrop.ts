/**
 * Кадрирование обложки «Маралы х Драконы» (`deerlol`): на узком viewport якорь левее центра,
 * чтобы при `object-cover` в кадре оставался оленёнок. Порог синхронизирован с Пиданом (`620px`).
 */
import { TOUR_SPRING_3_COVER_LAYOUT_MIN_WIDTH_PX } from './tourSpring3CoverCrop';

export const TOUR_SPRING_6_COVER_LAYOUT_MIN_WIDTH_PX = TOUR_SPRING_3_COVER_LAYOUT_MIN_WIDTH_PX;

/** `< 620px` (mobile): якорь левее — оленёнок в кадре при вертикальном hero. */
export const TOUR_SPRING_6_COVER_OBJECT_POSITION_LT620 = '12% 50%' as const;
/** `≥ 620px` до `lg` (tablet): умеренный сдвиг влево, без центра по сену. */
export const TOUR_SPRING_6_COVER_OBJECT_POSITION_GTE620 = '20% 50%' as const;
/** `lg` и шире (desktop hero / широкий кроп). */
export const TOUR_SPRING_6_COVER_OBJECT_POSITION_LG = 'center center' as const;

export const TOUR_SPRING_6_COVER_HERO_IMG_OBJECT_CLASS =
  'object-tour-detail-hero-spring-6-tight min-[620px]:object-tour-detail-hero-spring-6-wide lg:object-tour-detail-hero-desktop-spring-6-wide' as const;

export const TOUR_SPRING_6_COVER_CARD_IMG_OBJECT_CLASS =
  'object-tour-card-cover-spring-6-tight min-[620px]:object-tour-card-cover-spring-6-wide lg:object-tour-card-cover-desktop-spring-6-wide' as const;

export function resolveTourSpring6CoverBackgroundPosition(
  matchesMin620: boolean,
  matchesLg: boolean
): string {
  if (!matchesMin620) return TOUR_SPRING_6_COVER_OBJECT_POSITION_LT620;
  if (!matchesLg) return TOUR_SPRING_6_COVER_OBJECT_POSITION_GTE620;
  return TOUR_SPRING_6_COVER_OBJECT_POSITION_LG;
}
