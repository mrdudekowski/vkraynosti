import { resolveMediaAssetUrl } from '../constants/publicAssetBase';
import type { TourMediaBundle } from '../constants/generated/fallTourMedia.generated';

function resolveOptionalUrl(url: string | undefined): string | undefined {
  return url != null ? resolveMediaAssetUrl(url) : undefined;
}

function resolvePosterMap(
  posters: Record<string, string> | undefined
): Record<string, string> | undefined {
  if (posters == null) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(posters).map(([gridSrc, posterSrc]) => [
      resolveMediaAssetUrl(gridSrc),
      resolveMediaAssetUrl(posterSrc),
    ])
  );
}

/** Resolve logical `/tours/...` paths in a generated media bundle to runtime URLs. */
export function resolveTourMediaBundleUrls(bundle: TourMediaBundle): TourMediaBundle {
  return {
    imageUrl: resolveMediaAssetUrl(bundle.imageUrl),
    galleryImages: bundle.galleryImages.map(resolveMediaAssetUrl),
    galleryGridUrls: bundle.galleryGridUrls.map(resolveMediaAssetUrl),
    prefaceBackgroundImageUrl: resolveOptionalUrl(bundle.prefaceBackgroundImageUrl),
    gridVideoPosters: resolvePosterMap(bundle.gridVideoPosters),
    gridVideoPostersMobile: resolvePosterMap(bundle.gridVideoPostersMobile),
  };
}
