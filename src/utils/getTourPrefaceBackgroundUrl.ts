import {
  TOUR_COVER_MOBILE_OVERRIDES,
  TOUR_WINTER_3_PREFACE_BACKGROUND,
  TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE,
} from '../constants/images';
import { isVideoAssetUrl } from './isVideoAssetUrl';
import { resolveTourCoverMobileUrl } from './tourCoverMobileVariant';
import type { Tour } from '../types';

interface ResolveTourPrefaceBackgroundUrlParams {
  tour: Tour;
  /** Still-галерея (`galleryImages`): fallback для preface — только webp, не video. */
  galleryStillUrls: string[];
  isLgOrAbove: boolean;
}

export const resolveTourPrefaceBackgroundUrl = ({
  tour,
  galleryStillUrls,
  isLgOrAbove,
}: ResolveTourPrefaceBackgroundUrlParams): string | null => {
  const explicitPrefaceUrl = tour.prefaceBackgroundImageUrl ?? null;
  const stillFallbackRaw = galleryStillUrls.length > 1 ? galleryStillUrls[1] : null;
  const stillFallback =
    stillFallbackRaw != null && !isVideoAssetUrl(stillFallbackRaw) ? stillFallbackRaw : null;

  if (isLgOrAbove) {
    return explicitPrefaceUrl ?? stillFallback;
  }

  if (explicitPrefaceUrl === TOUR_WINTER_3_PREFACE_BACKGROUND) {
    return TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE;
  }

  if (explicitPrefaceUrl != null) {
    return resolveTourCoverMobileUrl(explicitPrefaceUrl, TOUR_COVER_MOBILE_OVERRIDES);
  }

  return stillFallback;
};

interface ResolveTourHeroImageUrlParams {
  tour: Tour;
  gridGalleryUrls: string[];
  isLgOrAbove: boolean;
}

export const resolveTourHeroImageUrl = ({
  tour,
  gridGalleryUrls,
  isLgOrAbove,
}: ResolveTourHeroImageUrlParams): string => {
  if (isLgOrAbove) {
    return tour.imageUrl;
  }

  if (!isVideoAssetUrl(tour.imageUrl)) {
    return resolveTourCoverMobileUrl(tour.imageUrl, TOUR_COVER_MOBILE_OVERRIDES);
  }

  const gridHeroCandidate = gridGalleryUrls[0];
  if (gridHeroCandidate != null && !isVideoAssetUrl(gridHeroCandidate)) {
    return resolveTourCoverMobileUrl(gridHeroCandidate, TOUR_COVER_MOBILE_OVERRIDES);
  }
  return tour.imageUrl;
};
