import { describe, expect, it } from 'vitest';
import { resolveMediaAssetUrl } from '../constants/publicAssetBase';
import {
  resolveTourCoverMobileUrl,
  tourCoverMobileVariantUrl,
} from './tourCoverMobileVariant';

describe('tourCoverMobileVariantUrl', () => {
  it('appends mobile suffix before webp extension', () => {
    const springHero = resolveMediaAssetUrl('/tours/spring-3/hero.webp');
    expect(tourCoverMobileVariantUrl(springHero)).toBe(
      resolveMediaAssetUrl('/tours/spring-3/hero.mobile.webp')
    );
    const fallCover = resolveMediaAssetUrl('/tours/fall-4/cover.webp');
    expect(tourCoverMobileVariantUrl(fallCover)).toBe(
      resolveMediaAssetUrl('/tours/fall-4/cover.mobile.webp')
    );
  });
});

describe('resolveTourCoverMobileUrl', () => {
  it('uses override when desktop URL is non-standard', () => {
    const desktop = resolveMediaAssetUrl('/tours/spring-10/beach.webp');
    const mobile = resolveMediaAssetUrl('/tours/spring-10/beach.mobile.webp');
    expect(resolveTourCoverMobileUrl(desktop, { [desktop]: mobile })).toBe(mobile);
  });

  it('falls back to suffix rule without override', () => {
    expect(resolveTourCoverMobileUrl(resolveMediaAssetUrl('/tours/spring-1/hero.webp'))).toBe(
      resolveMediaAssetUrl('/tours/spring-1/hero.mobile.webp')
    );
  });
});
