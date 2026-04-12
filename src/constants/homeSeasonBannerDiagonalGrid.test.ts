import { describe, expect, it } from 'vitest';
import {
  computeHomeSeasonBannerDiagonalShiftXPercent,
  HOME_SEASON_BANNER_DIAGONAL_EDGE_ANGLE_DEG,
  homeSeasonBannerDiagonalBandClipPath,
} from './homeSeasonBannerDiagonalGrid';

describe('computeHomeSeasonBannerDiagonalShiftXPercent', () => {
  const hw = 0.5;

  it('at 45° equals heightOverWidth * 100 (tan 45° = 1)', () => {
    expect(computeHomeSeasonBannerDiagonalShiftXPercent(hw, 45)).toBeCloseTo(hw * 100, 10);
  });

  it('smaller angle gives larger horizontal shift than 45°', () => {
    const shallow = computeHomeSeasonBannerDiagonalShiftXPercent(
      hw,
      HOME_SEASON_BANNER_DIAGONAL_EDGE_ANGLE_DEG
    );
    const at45 = computeHomeSeasonBannerDiagonalShiftXPercent(hw, 45);
    expect(shallow).toBeGreaterThan(at45);
  });
});

describe('homeSeasonBannerDiagonalBandClipPath', () => {
  it('returns polygon for valid band and positive aspect', () => {
    const path = homeSeasonBannerDiagonalBandClipPath(0, 0.4);
    expect(path).toMatch(/^polygon\(/);
    expect(path).toContain('0% 0%');
    expect(path).toContain('100%');
  });

  it('returns none for invalid inputs', () => {
    expect(homeSeasonBannerDiagonalBandClipPath(-1, 0.5)).toBe('none');
    expect(homeSeasonBannerDiagonalBandClipPath(10, 0.5)).toBe('none');
    expect(homeSeasonBannerDiagonalBandClipPath(0, 0)).toBe('none');
    expect(homeSeasonBannerDiagonalBandClipPath(0, -1)).toBe('none');
  });
});
