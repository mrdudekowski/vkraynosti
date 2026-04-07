import { describe, expect, it } from 'vitest';
import { TOUR_WINTER_3_GALLERY } from './images';
import { isVideoAssetUrl } from '../utils/isVideoAssetUrl';

describe('Эталон галереи winter-3 (Фалаза × Грибановка)', () => {
  it('содержит ровно пять видео-URL по тем же правилам, что и TourDetailGallery', () => {
    const videoUrls = TOUR_WINTER_3_GALLERY.filter(isVideoAssetUrl);
    expect(videoUrls).toHaveLength(5);
  });
});
