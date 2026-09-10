import { describe, expect, it } from 'vitest';
import type { Tour } from '../types';
import { TOUR_SPRING_11_CLIP1_GRID_WEBM } from '../constants/images';
import { truncateTelegramTourDescription, getTelegramTourGalleryImageUrls } from './telegramMiniApp';
import { isVideoAssetUrl } from './isVideoAssetUrl';

const spring7Clip1 = '/tours/spring-7/ddn.clip1.grid.webm';

type GalleryTour = Pick<Tour, 'id' | 'galleryGridUrls' | 'galleryImages'>;

describe('getTelegramTourGalleryImageUrls', () => {
  it('keeps photos and drops grid video slots without poster substitutes', () => {
    const tour: GalleryTour = {
      id: 'spring-7',
      galleryGridUrls: ['/tours/spring-7/view.webp', spring7Clip1],
      galleryImages: [],
    };

    expect(getTelegramTourGalleryImageUrls(tour)).toEqual(['/tours/spring-7/view.webp']);
  });

  it('drops unknown video slots the same way', () => {
    const tour: GalleryTour = {
      id: 'summer-8',
      galleryGridUrls: ['/tours/summer-8/cover.webp', '/tours/summer-8/unknown.clip1.grid.webm'],
      galleryImages: [],
    };

    expect(getTelegramTourGalleryImageUrls(tour)).toEqual(['/tours/summer-8/cover.webp']);
  });

  it('excludes all video grid assets for spring-11 (Shkota)', () => {
    const tour: GalleryTour = {
      id: 'spring-11',
      galleryGridUrls: [
        '/tours/spring-11/hero.webp',
        '/tours/spring-11/view.webp',
        TOUR_SPRING_11_CLIP1_GRID_WEBM,
        '/tours/spring-11/view2.webp',
      ],
      galleryImages: [],
    };

    const urls = getTelegramTourGalleryImageUrls(tour);
    expect(urls.every(url => !isVideoAssetUrl(url))).toBe(true);
    expect(urls.some(url => url.includes('.poster.'))).toBe(false);
    expect(urls).toEqual([
      '/tours/spring-11/hero.webp',
      '/tours/spring-11/view.webp',
      '/tours/spring-11/view2.webp',
    ]);
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
