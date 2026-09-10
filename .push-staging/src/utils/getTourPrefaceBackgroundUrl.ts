import {
  TOUR_COVER_MOBILE_OVERRIDES,
  TOUR_WINTER_3_PREFACE_BACKGROUND,
  TOUR_WINTER_3_PREFACE_BACKGROUND_MOBILE,
} from '../constants/images';
import { isVideoAssetUrl } from './isVideoAssetUrl';
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
    const explicitMobileVariant = TOUR_COVER_MOBILE_OVERRIDES[explicitPrefaceUrl];
    if (explicitMobileVariant != null) {
      return explicitMobileVariant;
    }
    return explicitPrefaceUrl;
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

  const explicitMobileVariant = TOUR_COVER_MOBILE_OVERRIDES[tour.imageUrl];
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
    return TOUR_COVER_MOBILE_OVERRIDES[gridHeroCandidate] ?? gridHeroCandidate;
  }

  return tour.imageUrl;
};
