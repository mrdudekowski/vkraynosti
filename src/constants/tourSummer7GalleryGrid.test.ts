import { describe, expect, it } from 'vitest';
import {
  TOUR_SUMMER_7_CLIP1_GRID_WEBM,
  TOUR_SUMMER_7_CLIP2_GRID_WEBM,
  TOUR_SUMMER_7_DUB_IMAGE,
  TOUR_SUMMER_7_FIN_IMAGE,
  TOUR_SUMMER_7_GALLERY_GRID,
  TOUR_SUMMER_7_SKAL_34_IMAGE,
  TOUR_SUMMER_7_SKAL_POINT3_IMAGE,
} from './images';

/** Кадры bento `severCoast` после `galleryGridUrls.slice(2)` в `TourDetailPage`. */
const summer7GridAfterPreface = TOUR_SUMMER_7_GALLERY_GRID.slice(2);

describe('summer-7 gallery grid (severCoast)', () => {
  it('11 слотов после cover/preface с grid-webm (не viewer)', () => {
    expect(summer7GridAfterPreface).toHaveLength(11);
    expect(summer7GridAfterPreface.every((url) => !url.endsWith('.webm') || url.includes('.grid.webm'))).toBe(
      true
    );
  });

  it('индексы совпадают с guard TourDetailGallery severCoast', () => {
    expect(summer7GridAfterPreface[0]).toBe(TOUR_SUMMER_7_CLIP1_GRID_WEBM);
    expect(summer7GridAfterPreface[1]).toBe(TOUR_SUMMER_7_DUB_IMAGE);
    expect(summer7GridAfterPreface[2]).toBe(TOUR_SUMMER_7_CLIP2_GRID_WEBM);
    expect(summer7GridAfterPreface[3]).toBe(TOUR_SUMMER_7_SKAL_POINT3_IMAGE);
    expect(summer7GridAfterPreface[4]).toBe(TOUR_SUMMER_7_SKAL_34_IMAGE);
    expect(summer7GridAfterPreface[10]).toBe(TOUR_SUMMER_7_FIN_IMAGE);
  });
});
