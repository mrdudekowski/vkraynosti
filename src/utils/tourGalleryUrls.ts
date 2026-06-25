import type { Tour } from '../types';

/** URL для сетки галереи: качественные фото и grid-варианты видео. */
export function getTourGalleryGridUrls(
  tour: Pick<Tour, 'galleryGridUrls' | 'galleryImages'>,
): string[] {
  return tour.galleryGridUrls ?? tour.galleryImages;
}
