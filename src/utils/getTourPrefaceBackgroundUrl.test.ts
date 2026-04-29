import { describe, expect, it } from 'vitest';
import {
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
      viewerGalleryUrls: ['/a.webp', '/b.webp'],
      gridGalleryUrls: ['/a.grid.webp', '/b.grid.webp'],
      isLgOrAbove: false,
    });
    expect(value).toBe(TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE);
  });

  it('uses grid preface fallback on mobile when explicit preface matches viewer index 1', () => {
    const viewer = ['/cover.webp', '/preface.webp'];
    const grid = ['/cover.grid.webp', '/preface.grid.webp'];
    const tour = buildTour('/preface.webp');
    const value = resolveTourPrefaceBackgroundUrl({
      tour,
      viewerGalleryUrls: viewer,
      gridGalleryUrls: grid,
      isLgOrAbove: false,
    });
    expect(value).toBe('/preface.grid.webp');
  });

  it('uses mapped mobile preface variant on mobile when available', () => {
    const tour = buildTour(TOUR_SPRING_10_PREFACE_BACKGROUND);
    const value = resolveTourPrefaceBackgroundUrl({
      tour,
      viewerGalleryUrls: ['/cover.webp', TOUR_SPRING_10_PREFACE_BACKGROUND],
      gridGalleryUrls: ['/cover.grid.webp', '/preface.grid.webp'],
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
});
