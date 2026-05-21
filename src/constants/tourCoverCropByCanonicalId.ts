import {
  resolveTourSpring3CoverBackgroundPosition,
  TOUR_SPRING_3_COVER_CARD_IMG_OBJECT_CLASS,
} from './tourSpring3CoverCrop';
import {
  resolveTourSpring6CoverBackgroundPosition,
  TOUR_SPRING_6_COVER_CARD_IMG_OBJECT_CLASS,
} from './tourSpring6CoverCrop';

/** Классы `object-position` / `object-*` для обложки на карточке и expand-плитке главной. */
export function getTourCoverCardImgObjectClass(canonicalTourId: string): string | undefined {
  if (canonicalTourId === 'spring-3') return TOUR_SPRING_3_COVER_CARD_IMG_OBJECT_CLASS;
  if (canonicalTourId === 'spring-6') return TOUR_SPRING_6_COVER_CARD_IMG_OBJECT_CLASS;
  return undefined;
}

/** `background-position` для hero-карусели (CSS background-cover на слайде). */
export function resolveTourHeroCoverBackgroundPosition(
  canonicalTourId: string,
  matchesMin620: boolean,
  matchesLg: boolean
): string | undefined {
  if (canonicalTourId === 'spring-3') {
    return resolveTourSpring3CoverBackgroundPosition(matchesMin620, matchesLg);
  }
  if (canonicalTourId === 'spring-6') {
    return resolveTourSpring6CoverBackgroundPosition(matchesMin620, matchesLg);
  }
  return undefined;
}
