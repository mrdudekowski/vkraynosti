import { describe, expect, it } from 'vitest';
import {
  TOUR_WINTER_3_GALLERY,
  TOUR_WINTER_3_GALLERY_GRID,
} from './images';
import { isVideoAssetUrl } from '../utils/isVideoAssetUrl';

describe('Эталон галереи winter-3 (Фалаза × Грибановка)', () => {
  it('viewer: ровно пять видео-URL по тем же правилам, что и TourDetailGallery', () => {
    const videoUrls = TOUR_WINTER_3_GALLERY.filter(isVideoAssetUrl);
    expect(videoUrls).toHaveLength(5);
  });

  it('сетка страницы: только clip1–clip5 как видео (остальные кадры — webp)', () => {
    const gridVideos = TOUR_WINTER_3_GALLERY_GRID.filter(isVideoAssetUrl);
    expect(gridVideos).toHaveLength(5);
  });
});
