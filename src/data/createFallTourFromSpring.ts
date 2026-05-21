import type { Tour } from '../types';
import type { FallTourId } from '../constants/fallTourImages';
import type { TourMediaBundle } from '../constants/generated/fallTourMedia.generated';

export type { TourMediaBundle };

export function createFallTourFromSpring(
  springTour: Tour,
  fallId: FallTourId,
  media: TourMediaBundle
): Tour {
  const { imageUrl, galleryImages, galleryGridUrls, prefaceBackgroundImageUrl } = media;

  return {
    ...springTour,
    id: fallId,
    season: 'fall',
    contentSourceTourId: springTour.id,
    imageUrl,
    galleryImages: [...galleryImages],
    galleryGridUrls: [...galleryGridUrls],
    prefaceBackgroundImageUrl,
  };
}

function springTourSortKey(tour: Tour): number {
  return Number.parseInt(tour.id.replace('spring-', ''), 10);
}

/** `fall-1`…`fall-13` — контент `spring-1`…`spring-13`, медиа из `FALL_TOUR_MEDIA_BY_ID`. */
export function buildFallToursFromSpring(
  springTours: Tour[],
  mediaByFallId: Record<FallTourId, TourMediaBundle>
): Tour[] {
  const sorted = [...springTours].sort((a, b) => springTourSortKey(a) - springTourSortKey(b));

  if (sorted.length !== Object.keys(mediaByFallId).length) {
    throw new Error(
      `Spring tour count (${sorted.length}) does not match fall media bundles (${Object.keys(mediaByFallId).length})`
    );
  }

  return sorted.map((springTour, index) => {
    const fallId = `fall-${index + 1}` as FallTourId;
    const media = mediaByFallId[fallId];
    if (media == null) {
      throw new Error(`Missing fall media bundle for ${fallId}`);
    }
    return createFallTourFromSpring(springTour, fallId, media);
  });
}
