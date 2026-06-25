import { describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import { TOUR_SPRING_7_GRID_VIDEO_POSTERS } from '../constants/images';
import { truncateTelegramTourDescription, getTelegramTourGalleryImageUrls } from './telegramMiniApp';

const spring7Clip1 = '/tours/spring-7/ddn.clip1.grid.webm';

type GalleryTour = Pick<Tour, 'id' | 'galleryGridUrls' | 'galleryImages'>;

describe('getTelegramTourGalleryImageUrls', () => {
  it('keeps photos and replaces grid videos with poster stills', () => {
    const tour: GalleryTour = {
      id: 'spring-7',
      galleryGridUrls: ['/tours/spring-7/view.webp', spring7Clip1],
      galleryImages: [],
    };

    expect(getTelegramTourGalleryImageUrls(tour)).toEqual([
      '/tours/spring-7/view.webp',
      TOUR_SPRING_7_GRID_VIDEO_POSTERS[spring7Clip1],
    ]);
  });

  it('drops video slots without a poster mapping', () => {
    const tour: GalleryTour = {
      id: 'summer-8',
      galleryGridUrls: ['/tours/summer-8/cover.webp', '/tours/summer-8/unknown.clip1.grid.webm'],
      galleryImages: [],
    };

    expect(getTelegramTourGalleryImageUrls(tour)).toEqual(['/tours/summer-8/cover.webp']);
  });
});

describe('truncateTelegramTourDescription', () => {
  it('keeps short descriptions unchanged', () => {
    expect(truncateTelegramTourDescription('Короткий текст')).toBe('Короткий текст');
  });

  it('truncates long descriptions with ellipsis', () => {
    const longText = 'А'.repeat(500);
    const result = truncateTelegramTourDescription(longText, 40);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(40);
  });
});
