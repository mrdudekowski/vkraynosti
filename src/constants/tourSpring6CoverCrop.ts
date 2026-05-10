/**
 * Кадрирование обложки «Маралы х Драконы» (`deerlol`): на узком viewport якорь левее центра,
 * чтобы при `object-cover` в кадре оставался оленёнок. Порог синхронизирован с Пиданом (`620px`).
 */
import { TOUR_SPRING_3_COVER_LAYOUT_MIN_WIDTH_PX } from './tourSpring3CoverCrop';

export const TOUR_SPRING_6_COVER_LAYOUT_MIN_WIDTH_PX = TOUR_SPRING_3_COVER_LAYOUT_MIN_WIDTH_PX;

/** `< 620px`: сдвиг влево относительно центра — оленёнок в видимой области. */
export const TOUR_SPRING_6_COVER_OBJECT_POSITION_LT620 = '28% 50%' as const;
/** `≥ 620px`: прежнее центрирование для широкого кропа. */
export const TOUR_SPRING_6_COVER_OBJECT_POSITION_GTE620 = 'center center' as const;

export const TOUR_SPRING_6_COVER_HERO_IMG_OBJECT_CLASS =
  'object-tour-detail-hero-spring-6-tight min-[620px]:object-tour-detail-hero-spring-6-wide' as const;

export const TOUR_SPRING_6_COVER_CARD_IMG_OBJECT_CLASS =
  'object-tour-card-cover-spring-6-tight min-[620px]:object-tour-card-cover-spring-6-wide' as const;

export function resolveTourSpring6CoverBackgroundPosition(matchesMin620: boolean): string {
  if (!matchesMin620) return TOUR_SPRING_6_COVER_OBJECT_POSITION_LT620;
  return TOUR_SPRING_6_COVER_OBJECT_POSITION_GTE620;
}
