import { describe, expect, it } from 'vitest';
import {
  resolveTourCoverMobileUrl,
  tourCoverMobileVariantUrl,
} from './tourCoverMobileVariant';

describe('tourCoverMobileVariantUrl', () => {
  it('appends mobile suffix before webp extension', () => {
    expect(tourCoverMobileVariantUrl('/vkraynosti/tours/spring-3/hero.webp')).toBe(
      '/vkraynosti/tours/spring-3/hero.mobile.webp'
    );
    expect(tourCoverMobileVariantUrl('/vkraynosti/tours/fall-4/cover.webp')).toBe(
      '/vkraynosti/tours/fall-4/cover.mobile.webp'
    );
  });
});

describe('resolveTourCoverMobileUrl', () => {
  it('uses override when desktop URL is non-standard', () => {
    const desktop = '/vkraynosti/tours/spring-10/beach.webp';
    const mobile = '/vkraynosti/tours/spring-10/beach.mobile.webp';
    expect(resolveTourCoverMobileUrl(desktop, { [desktop]: mobile })).toBe(mobile);
  });

  it('falls back to suffix rule without override', () => {
    expect(resolveTourCoverMobileUrl('/vkraynosti/tours/spring-1/hero.webp')).toBe(
      '/vkraynosti/tours/spring-1/hero.mobile.webp'
    );
  });
});
