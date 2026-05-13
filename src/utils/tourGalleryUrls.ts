import type { Tour } from '../types';

/** URL для сетки галереи: качественные фото и grid-варианты видео. */
export function getTourGalleryGridUrls(tour: Tour): string[] {
  return tour.galleryGridUrls ?? tour.galleryImages;
}
