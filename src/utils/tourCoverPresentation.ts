import type { CSSProperties } from 'react';
import { getTourCoverCardImgObjectClass } from '../constants/tourCoverCropByCanonicalId';
import { TOUR_SPRING_3_COVER_HERO_IMG_OBJECT_CLASS } from '../constants/tourSpring3CoverCrop';
import { TOUR_SPRING_6_COVER_HERO_IMG_OBJECT_CLASS } from '../constants/tourSpring6CoverCrop';
import { TOUR_SUMMER_1_COVER_HERO_IMG_OBJECT_CLASS } from '../constants/tourSummer1GalleryCrop';
import { TOUR_SUMMER_7_COVER_HERO_IMG_OBJECT_CLASS } from '../constants/tourSummer7CoverCrop';
import { TOUR_SUMMER_11_COVER_HERO_IMG_OBJECT_CLASS } from '../constants/tourSummer11CoverCrop';
import type { Tour } from '../types';
import {
  formatCoverCropCssVars,
  formatMediaFocalPoint,
  hasHeroCoverCrop,
} from './mediaObjectPosition';

type CoverTour = Pick<Tour, 'id' | 'contentSourceTourId' | 'coverCrop'>;

export function tourCardCoverImgProps(
  tour: CoverTour,
  fallbackId: string = tour.contentSourceTourId ?? tour.id,
): {
  imgClassName?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
} {
  if (tour.coverCrop?.card != null) {
    return {
      wrapperClassName: 'media-object-position',
      wrapperStyle: {
        ['--media-object-position']: formatMediaFocalPoint(tour.coverCrop.card),
      } as CSSProperties,
    };
  }
  return { imgClassName: getTourCoverCardImgObjectClass(fallbackId) };
}

export function getLegacyTourHeroObjectClass(
  tourId: string,
  contentSourceTourId?: string,
): {
  heroImageObjectClassName?: string;
  desktopHeroImgClassName?: string;
} {
  const heroLayoutTourId = contentSourceTourId ?? tourId;
  if (heroLayoutTourId === 'spring-3') {
    return { heroImageObjectClassName: TOUR_SPRING_3_COVER_HERO_IMG_OBJECT_CLASS };
  }
  if (heroLayoutTourId === 'spring-6') {
    return { heroImageObjectClassName: TOUR_SPRING_6_COVER_HERO_IMG_OBJECT_CLASS };
  }
  if (tourId === 'summer-1') {
    return { heroImageObjectClassName: TOUR_SUMMER_1_COVER_HERO_IMG_OBJECT_CLASS };
  }
  if (tourId === 'summer-7') {
    return { heroImageObjectClassName: TOUR_SUMMER_7_COVER_HERO_IMG_OBJECT_CLASS };
  }
  if (tourId === 'summer-11') {
    return { heroImageObjectClassName: TOUR_SUMMER_11_COVER_HERO_IMG_OBJECT_CLASS };
  }
  if (tourId === 'winter-3') {
    return { desktopHeroImgClassName: 'lg:object-tour-detail-hero-desktop-winter-3' };
  }
  if (tourId === 'winter-4') {
    return { desktopHeroImgClassName: 'lg:object-tour-detail-hero-desktop-winter-4' };
  }
  if (heroLayoutTourId === 'spring-1') {
    return { desktopHeroImgClassName: 'lg:object-tour-detail-hero-desktop-spring-1' };
  }
  if (heroLayoutTourId === 'spring-4') {
    return { desktopHeroImgClassName: 'lg:object-tour-detail-hero-desktop-spring-4' };
  }
  if (heroLayoutTourId === 'spring-5') {
    return { desktopHeroImgClassName: 'lg:object-tour-detail-hero-desktop-spring-5' };
  }
  if (heroLayoutTourId === 'spring-13' || tourId === 'summer-5') {
    return { desktopHeroImgClassName: 'lg:object-tour-detail-hero-desktop-spring-13' };
  }
  return {};
}

export function tourHeroObjectProps(tour: CoverTour): {
  heroImageObjectClassName?: string;
  desktopHeroImgClassName?: string;
  style?: CSSProperties;
} {
  if (hasHeroCoverCrop(tour.coverCrop)) {
    return {
      heroImageObjectClassName: 'tour-hero-object-position',
      style: formatCoverCropCssVars(tour.coverCrop) as CSSProperties,
    };
  }
  return getLegacyTourHeroObjectClass(tour.id, tour.contentSourceTourId);
}
