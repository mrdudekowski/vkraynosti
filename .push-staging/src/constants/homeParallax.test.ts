import { describe, expect, it } from 'vitest';
import { computeParallaxTranslateYPx, HOME_SKY_PARALLAX_SCROLL_FACTOR } from './homeParallax';

describe('computeParallaxTranslateYPx', () => {
  it('multiplies scroll by factor', () => {
    expect(computeParallaxTranslateYPx(100, 0.2)).toBe(20);
    expect(computeParallaxTranslateYPx(0, HOME_SKY_PARALLAX_SCROLL_FACTOR)).toBe(0);
  });

  it('returns 0 for non-finite inputs', () => {
    expect(computeParallaxTranslateYPx(Number.NaN, 0.1)).toBe(0);
    expect(computeParallaxTranslateYPx(10, Number.NaN)).toBe(0);
  });
});
