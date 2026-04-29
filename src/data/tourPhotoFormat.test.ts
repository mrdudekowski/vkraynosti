import { describe, expect, it } from 'vitest';
import { TOURS } from './toursData';

const VIDEO_EXTENSION_RE = /\.(webm|mp4|mov)(\?|#|$)/i;
const WEBP_EXTENSION_RE = /\.webp(\?|#|$)/i;

const isTourPhotoAsset = (url: string): boolean => url.includes('/tours/');

describe('tour photo format policy', () => {
  it('stores all non-video tour photo assets in webp format', () => {
    const nonWebpPhotoUrls: string[] = [];

    for (const tour of TOURS) {
      const candidateUrls = [
        tour.imageUrl,
        ...(tour.galleryImages ?? []),
        ...(tour.galleryGridUrls ?? []),
        ...(tour.prefaceBackgroundImageUrl ? [tour.prefaceBackgroundImageUrl] : []),
      ];

      for (const url of candidateUrls) {
        if (!isTourPhotoAsset(url)) continue;
        if (VIDEO_EXTENSION_RE.test(url)) continue;
        if (WEBP_EXTENSION_RE.test(url)) continue;
        nonWebpPhotoUrls.push(url);
      }
    }

    expect(nonWebpPhotoUrls).toEqual([]);
  });
});
