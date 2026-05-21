import { describe, expect, it } from 'vitest';
import { IMAGES } from '../constants/images';
import { getHomeLcpPreloadImageUrl } from './getHomeLcpPreloadImageUrl';

describe('getHomeLcpPreloadImageUrl', () => {
  it('uses season section poster on desktop gate layout', () => {
    expect(
      getHomeLcpPreloadImageUrl(true, 'spring', '/vkraynosti/tours/spring-1/hero.webp')
    ).toBe(IMAGES.seasonSection.spring);
  });

  it('uses first tour cover on mobile layout', () => {
    const cover = '/vkraynosti/tours/spring-3/hero.webp';
    expect(getHomeLcpPreloadImageUrl(false, 'spring', cover)).toBe(cover);
  });

  it('falls back to season section when mobile has no tour cover', () => {
    expect(getHomeLcpPreloadImageUrl(false, 'winter', undefined)).toBe(
      IMAGES.seasonSection.winter
    );
  });
});
