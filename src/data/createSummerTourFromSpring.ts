import type { Tour } from '../types';
import {
  SUMMER_CONTENT_SOURCE_PAIRS,
  type SummerContentSourceTourId,
} from './seasonTourRegistry';
import type { TourMediaBundle } from '../constants/generated/summerPairedTourMedia.generated';

export function createSummerTourFromSpring(
  springTour: Tour,
  summerId: SummerContentSourceTourId,
  media: TourMediaBundle
): Tour {
  const { imageUrl, galleryImages, galleryGridUrls, prefaceBackgroundImageUrl } = media;

  return {
    ...springTour,
    id: summerId,
    season: 'summer',
    contentSourceTourId: springTour.id,
    imageUrl,
    galleryImages: [...galleryImages],
    galleryGridUrls: [...galleryGridUrls],
    prefaceBackgroundImageUrl,
  };
}

/** Летние туры 2–6: контент с парного spring, медиа из `SUMMER_PAIRED_TOUR_MEDIA_BY_ID`. */
export function buildSummerToursFromSpring(
  springTours: Tour[],
  mediaBySummerId: Record<SummerContentSourceTourId, TourMediaBundle>
): Tour[] {
  const springById = new Map(springTours.map((tour) => [tour.id, tour]));

  return (Object.keys(SUMMER_CONTENT_SOURCE_PAIRS) as SummerContentSourceTourId[]).map(
    (summerId) => {
      const springId = SUMMER_CONTENT_SOURCE_PAIRS[summerId];
      const springTour = springById.get(springId);
      if (springTour == null) {
        throw new Error(`Missing spring tour ${springId} for ${summerId}`);
      }
      const media = mediaBySummerId[summerId];
      if (media == null) {
        throw new Error(`Missing summer media bundle for ${summerId}`);
      }
      return createSummerTourFromSpring(springTour, summerId, media);
    }
  );
}
