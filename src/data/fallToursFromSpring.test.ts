import { describe, expect, it } from 'vitest';
import { FALL_TOUR_COUNT } from '../constants/fallTourImages';
import { getTourGalleryLayoutVariant } from '../constants/tourGalleryLayoutVariant';
import { getToursBySeason, getTourById } from './toursData';

describe('fall tours mirrored from spring', () => {
  const fallTours = getToursBySeason('fall');
  const springTours = getToursBySeason('spring');

  it('13 осенних туров — копии всех весенних', () => {
    expect(fallTours).toHaveLength(FALL_TOUR_COUNT);
    expect(springTours).toHaveLength(FALL_TOUR_COUNT);
  });

  it('fall-4 дублирует spring-4 (контент, свои URL галереи и hero)', () => {
    const spring = getTourById('spring-4');
    const fall = getTourById('fall-4');
    expect(spring).toBeDefined();
    expect(fall).toBeDefined();
    expect(fall?.title).toBe(spring?.title);
    expect(fall?.contentSourceTourId).toBe('spring-4');
    expect(fall?.galleryGridUrls?.every((url) => url.includes('/tours/fall-4/'))).toBe(true);
    expect(fall?.galleryGridUrls?.some((url) => url.includes('/tours/spring-4/'))).toBe(false);
    expect(fall?.imageUrl).toContain('/tours/fall-4/cover.webp');
    expect(fall?.imageUrl).not.toBe(spring?.imageUrl);
  });

  it('bento-сетка fall-4 как у spring-4 (через contentSource)', () => {
    expect(getTourGalleryLayoutVariant('fall-4')).toBe(getTourGalleryLayoutVariant('spring-4'));
  });

  it('bento-сетка fall-5/fall-6 как у spring-5/spring-6 (через contentSource)', () => {
    expect(getTourGalleryLayoutVariant('fall-5')).toBe(getTourGalleryLayoutVariant('spring-5'));
    expect(getTourGalleryLayoutVariant('fall-6')).toBe(getTourGalleryLayoutVariant('spring-6'));
  });

  it('fall-6 использует уникальный осенний hero.webp', () => {
    const fall = getTourById('fall-6');
    expect(fall?.imageUrl).toContain('/tours/fall-6/hero.webp');
  });
});
