import { IMAGES, TOUR_COVER_MOBILE_OVERRIDES } from '../constants/images';
import type { Season } from '../types';
import { resolveTourCoverMobileUrl } from './tourCoverMobileVariant';

/**
 * URL для `<link rel="preload" as="image" fetchPriority="high">` на главной.
 * Desktop gate (md+): постер сезонной секции; mobile: mobile-вариант обложки первого слайда hero carousel.
 */
export function getHomeLcpPreloadImageUrl(
  isHomeGateDesktopLayout: boolean,
  activeSeason: Season,
  firstTourCoverUrl: string | undefined
): string {
  if (isHomeGateDesktopLayout) {
    return IMAGES.seasonSection[activeSeason];
  }
  if (firstTourCoverUrl != null) {
    return resolveTourCoverMobileUrl(firstTourCoverUrl, TOUR_COVER_MOBILE_OVERRIDES);
  }
  return IMAGES.seasonSection[activeSeason];
}
