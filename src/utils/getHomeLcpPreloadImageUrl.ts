import { IMAGES } from '../constants/images';
import type { Season } from '../types';

/**
 * URL для `<link rel="preload" as="image" fetchPriority="high">` на главной.
 * Desktop gate (md+): постер сезонной секции; mobile: обложка первого слайда hero carousel.
 */
export function getHomeLcpPreloadImageUrl(
  isHomeGateDesktopLayout: boolean,
  activeSeason: Season,
  firstTourCoverUrl: string | undefined
): string {
  if (isHomeGateDesktopLayout) {
    return IMAGES.seasonSection[activeSeason];
  }
  return firstTourCoverUrl ?? IMAGES.seasonSection[activeSeason];
}
