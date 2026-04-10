import { describe, expect, it } from 'vitest';
import {
  computeHomeScrollFadeProgress,
  HOME_SCROLL_FADE_TOP_END_SHARE,
  HOME_SCROLL_FADE_TOP_START_SHARE,
} from './homeScrollFade';

describe('computeHomeScrollFadeProgress', () => {
  const vh = 1000;

  it('is 0 when block top is at or below start line', () => {
    expect(computeHomeScrollFadeProgress(vh * HOME_SCROLL_FADE_TOP_START_SHARE, vh)).toBe(0);
    expect(computeHomeScrollFadeProgress(vh * HOME_SCROLL_FADE_TOP_START_SHARE + 50, vh)).toBe(0);
  });

  it('is 1 when block top is at or above end line', () => {
    expect(computeHomeScrollFadeProgress(vh * HOME_SCROLL_FADE_TOP_END_SHARE, vh)).toBe(1);
    expect(computeHomeScrollFadeProgress(vh * HOME_SCROLL_FADE_TOP_END_SHARE - 100, vh)).toBe(1);
  });

  it('interpolates between start and end', () => {
    const midTop = (vh * HOME_SCROLL_FADE_TOP_START_SHARE + vh * HOME_SCROLL_FADE_TOP_END_SHARE) / 2;
    const t = computeHomeScrollFadeProgress(midTop, vh);
    expect(t).toBeGreaterThan(0);
    expect(t).toBeLessThan(1);
    expect(t).toBeCloseTo(0.5, 5);
  });

  it('returns 1 for non-positive viewport height', () => {
    expect(computeHomeScrollFadeProgress(0, 0)).toBe(1);
  });
});
