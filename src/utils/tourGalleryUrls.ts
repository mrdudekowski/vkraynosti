import type { Tour } from '../types';

/** URL для полноэкранного просмотра и OG (полное качество). */
export function getTourGalleryViewerUrls(tour: Tour): string[] {
  return tour.galleryViewerUrls ?? tour.galleryImages;
}

/** URL для сетки галереи и обложек карточек (оптимизированные). */
export function getTourGalleryGridUrls(tour: Tour): string[] {
  return tour.galleryGridUrls ?? tour.galleryImages;
}
