import { describe, expect, it } from 'vitest';

import { TOURS } from './toursData';

function tourMediaFolder(tourId: string): string {
  return `/tours/${tourId}/`;
}

describe('tour media isolation', () => {
  it('каждый URL медиа тура ведёт в папку своего id', () => {
    const violations: string[] = [];

    for (const tour of TOURS) {
      const ownFolder = tourMediaFolder(tour.id);
      const urls = [
        tour.imageUrl,
        ...tour.galleryImages,
        ...(tour.galleryGridUrls ?? []),
        ...(tour.prefaceBackgroundImageUrl ? [tour.prefaceBackgroundImageUrl] : []),
      ].filter((url) => url.includes('/tours/'));

      for (const url of urls) {
        if (!url.includes(ownFolder)) {
          violations.push(`${tour.id}: ${url}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('summer-3 не ссылается на spring-10 в медиа', () => {
    const summer3 = TOURS.find((t) => t.id === 'summer-3');
    expect(summer3).toBeDefined();
    const allUrls = [
      summer3!.imageUrl,
      ...summer3!.galleryImages,
      ...(summer3!.galleryGridUrls ?? []),
    ];
    expect(allUrls.every((url) => url.includes('/tours/summer-3/'))).toBe(true);
    expect(allUrls.some((url) => url.includes('/spring-10/'))).toBe(false);
  });

  it('уникальные tour.id в каталоге', () => {
    const ids = TOURS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('season согласован с префиксом id', () => {
    for (const tour of TOURS) {
      expect(tour.id.startsWith(`${tour.season}-`)).toBe(true);
    }
  });
});
