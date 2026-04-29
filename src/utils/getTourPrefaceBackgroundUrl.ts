import {
  TOUR_MOBILE_IMAGE_VARIANTS,
  TOUR_WINTER_3_PREFACE_BACKGROUND,
  TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE,
} from '../constants/images';
import { isVideoAssetUrl } from './isVideoAssetUrl';
import type { Tour } from '../types';

interface ResolveTourPrefaceBackgroundUrlParams {
  tour: Tour;
  viewerGalleryUrls: string[];
  gridGalleryUrls: string[];
  isLgOrAbove: boolean;
}

export const resolveTourPrefaceBackgroundUrl = ({
  tour,
  viewerGalleryUrls,
  gridGalleryUrls,
  isLgOrAbove,
}: ResolveTourPrefaceBackgroundUrlParams): string | null => {
  const explicitPrefaceUrl = tour.prefaceBackgroundImageUrl ?? null;
  const viewerFallback = viewerGalleryUrls.length > 1 ? viewerGalleryUrls[1] : null;
  const gridFallback = gridGalleryUrls.length > 1 ? gridGalleryUrls[1] : null;

  if (isLgOrAbove) {
    return explicitPrefaceUrl ?? viewerFallback;
  }

  if (explicitPrefaceUrl === TOUR_WINTER_3_PREFACE_BACKGROUND) {
    return TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE;
  }

  if (explicitPrefaceUrl != null) {
    const explicitMobileVariant = TOUR_MOBILE_IMAGE_VARIANTS[explicitPrefaceUrl];
    if (explicitMobileVariant != null) {
      return explicitMobileVariant;
    }
    if (viewerFallback != null && gridFallback != null && explicitPrefaceUrl === viewerFallback) {
      return gridFallback;
    }
    return explicitPrefaceUrl;
  }

  return gridFallback ?? viewerFallback;
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
  const explicitMobileVariant = TOUR_MOBILE_IMAGE_VARIANTS[tour.imageUrl];
  if (explicitMobileVariant != null) {
    return explicitMobileVariant;
  }
  /**
   * Каноническая обложка (`tour.imageUrl`) может не совпадать с `gridGalleryUrls[0]` (например «Пидан»:
   * hero — `pd.preface.grid`, первый кадр сетки — `pd.hero.grid`). На мобильных нельзя подменять её на [0].
   */
  if (!isVideoAssetUrl(tour.imageUrl)) {
    return tour.imageUrl;
  }
  const gridHeroCandidate = gridGalleryUrls[0];
  if (gridHeroCandidate != null && !isVideoAssetUrl(gridHeroCandidate)) {
    return TOUR_MOBILE_IMAGE_VARIANTS[gridHeroCandidate] ?? gridHeroCandidate;
  }
  return tour.imageUrl;
};
