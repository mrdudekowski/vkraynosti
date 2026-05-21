import { describe, expect, it } from 'vitest';
import {
  TOUR_SPRING_3_COVER,
  TOUR_SPRING_3_GALLERY_GRID,
  TOUR_SPRING_10_COVER_GRID,
  TOUR_SPRING_10_COVER_MOBILE,
  TOUR_SPRING_10_PREFACE_BACKGROUND,
  TOUR_SPRING_10_PREFACE_BACKGROUND_MOBILE,
  TOUR_WINTER_3_PREFACE_BACKGROUND,
  TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE,
} from '../constants/images';
import type { Tour } from '../types';
import {
  resolveTourHeroImageUrl,
  resolveTourPrefaceBackgroundUrl,
} from './getTourPrefaceBackgroundUrl';

const buildTour = (prefaceBackgroundImageUrl?: string): Tour => ({
  id: 'spring-test',
  season: 'spring',
  title: 't',
  subtitle: 's',
  heroPhrase: 'h',
  duration: 'd',
  difficulty: 'Easy',
  price: 'p',
  description: 'desc',
  program: [],
  includedInPrice: [],
  imageUrl: '/tours/spring-test/cover.webp',
  galleryImages: [],
  prefaceBackgroundImageUrl,
});

describe('resolveTourPrefaceBackgroundUrl', () => {
  it('uses mobile-specific winter-3 preface asset on mobile', () => {
    const winterTour = { ...buildTour(TOUR_WINTER_3_PREFACE_BACKGROUND), id: 'winter-3', season: 'winter' as const };
    const value = resolveTourPrefaceBackgroundUrl({
      tour: winterTour,
      galleryStillUrls: ['/a.webp', '/b.webp'],
      isLgOrAbove: false,
    });
    expect(value).toBe(TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE);
  });

  it('ignores video URL at gallery still index 1 on mobile', () => {
    const tour = buildTour();
    const value = resolveTourPrefaceBackgroundUrl({
      tour,
      galleryStillUrls: ['/cover.webp', '/tours/x/clip1.grid.webm'],
      isLgOrAbove: false,
    });
    expect(value).toBeNull();
  });

  it('keeps quality preface fallback on mobile when explicit preface matches still index 1', () => {
    const viewer = ['/cover.webp', '/preface.webp'];
    const tour = buildTour('/preface.webp');
    const value = resolveTourPrefaceBackgroundUrl({
      tour,
      galleryStillUrls: viewer,
      isLgOrAbove: false,
    });
    expect(value).toBe('/preface.webp');
  });

  it('uses mapped mobile preface variant on mobile when available', () => {
    const tour = buildTour(TOUR_SPRING_10_PREFACE_BACKGROUND);
    const value = resolveTourPrefaceBackgroundUrl({
      tour,
      galleryStillUrls: ['/cover.webp', TOUR_SPRING_10_PREFACE_BACKGROUND],
      isLgOrAbove: false,
    });
    expect(value).toBe(TOUR_SPRING_10_PREFACE_BACKGROUND_MOBILE);
  });
});

describe('resolveTourHeroImageUrl', () => {
  it('uses mapped mobile hero variant when available', () => {
    const tour = {
      ...buildTour(),
      imageUrl: TOUR_SPRING_10_COVER_GRID,
    };
    const value = resolveTourHeroImageUrl({
      tour,
      gridGalleryUrls: [TOUR_SPRING_10_COVER_GRID],
      isLgOrAbove: false,
    });
    expect(value).toBe(TOUR_SPRING_10_COVER_MOBILE);
  });

  it('keeps tour.imageUrl on mobile when it differs from gridGalleryUrls[0] (spring-3 hero)', () => {
    const tour = {
      ...buildTour(),
      id: 'spring-3',
      imageUrl: TOUR_SPRING_3_COVER,
    };
    const value = resolveTourHeroImageUrl({
      tour,
      gridGalleryUrls: [...TOUR_SPRING_3_GALLERY_GRID],
      isLgOrAbove: false,
    });
    expect(value).toBe(TOUR_SPRING_3_COVER);
    expect(value).not.toBe(TOUR_SPRING_3_GALLERY_GRID[0]);
  });
});
