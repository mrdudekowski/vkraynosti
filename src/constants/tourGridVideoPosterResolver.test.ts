import { describe, expect, it } from 'vitest';
import {
  TOUR_SPRING_10_GALLERY_GRID,
  TOUR_SUMMER_1_CLIP1_GRID_WEBM,
  TOUR_WINTER_3_CLIP1_VIDEO,
} from './images';
import {
  getTourGridVideoPosterGetter,
  resolveTourGridVideoPoster,
} from './tourGridVideoPosterResolver';

describe('tourGridVideoPosterResolver', () => {
  it('возвращает постер для известного grid-webm и winter-3', () => {
    const poster = resolveTourGridVideoPoster('winter-3', TOUR_WINTER_3_CLIP1_VIDEO, true);
    expect(poster).toBeDefined();
    expect(poster).toMatch(/\.webp$/);
  });

  it('для тура без таблицы постеров — undefined', () => {
    expect(resolveTourGridVideoPoster('winter-1', TOUR_WINTER_3_CLIP1_VIDEO, true)).toBeUndefined();
  });

  it('getTourGridVideoPosterGetter: undefined если тура нет в таблице', () => {
    expect(getTourGridVideoPosterGetter('winter-1', true)).toBeUndefined();
  });

  it('summer-1 — постер для tch.clip1.grid.webm', () => {
    const poster = resolveTourGridVideoPoster('summer-1', TOUR_SUMMER_1_CLIP1_GRID_WEBM, true);
    expect(poster).toBe('/tours/summer-1/tch.clip1.poster.webp');
  });

  it('летняя копия Аскольда (summer-3) — постеры сетки как у spring-10', () => {
    const gridClip = TOUR_SPRING_10_GALLERY_GRID[2];
    expect(resolveTourGridVideoPoster('summer-3', gridClip, true)).toEqual(
      resolveTourGridVideoPoster('spring-10', gridClip, true)
    );
  });

  it('getTourGridVideoPosterGetter: колбэк совпадает с resolveTourGridVideoPoster', () => {
    const fn = getTourGridVideoPosterGetter('winter-3', true);
    expect(fn).toBeDefined();
    if (fn == null) return;
    expect(fn(TOUR_WINTER_3_CLIP1_VIDEO)).toBe(
      resolveTourGridVideoPoster('winter-3', TOUR_WINTER_3_CLIP1_VIDEO, true)
    );
  });
});
