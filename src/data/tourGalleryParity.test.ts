import { describe, expect, it } from 'vitest';
import { TOURS } from './toursData';

describe('Туры с galleryGridUrls', () => {
  it('длина grid совпадает с galleryImages (viewer)', () => {
    for (const tour of TOURS) {
      if (tour.galleryGridUrls == null) continue;
      expect(tour.galleryGridUrls.length).toBe(tour.galleryImages.length);
    }
  });
});
