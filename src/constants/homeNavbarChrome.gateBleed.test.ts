import { describe, expect, it } from 'vitest';
import {
  computeGateStageFullBleedMinHeight,
  computeHomeNavbarChromeSurfaceOpacity,
  computeHomeNavbarTopChromeOpacity,
  HOME_NAVBAR_CHROME_SURFACE_FADE_SCROLL_PX,
  HOME_NAVBAR_CHROME_SURFACE_OPACITY_STEP,
} from './homeNavbarChrome';

describe('computeGateStageFullBleedMinHeight', () => {
  it('returns true when hero anchor unknown', () => {
    expect(computeGateStageFullBleedMinHeight(100, null)).toBe(true);
  });

  it('stabilizes near boundary with 4px quantize (no jitter around heroMin)', () => {
    const heroMin = 500;
    expect(computeGateStageFullBleedMinHeight(499.2, heroMin)).toBe(
      computeGateStageFullBleedMinHeight(500.8, heroMin)
    );
    expect(computeGateStageFullBleedMinHeight(496, heroMin)).toBe(true);
    expect(computeGateStageFullBleedMinHeight(504, heroMin)).toBe(false);
  });
});

describe('computeHomeNavbarTopChromeOpacity', () => {
  it('returns 1 when hero anchor unknown', () => {
    expect(computeHomeNavbarTopChromeOpacity(0, null)).toBe(1);
  });

  it('uses same quantize band as gate bleed (show chrome when scroll reaches hero anchor)', () => {
    const heroMin = 500;
    expect(computeHomeNavbarTopChromeOpacity(496, heroMin)).toBe(0);
    expect(computeHomeNavbarTopChromeOpacity(504, heroMin)).toBe(1);
  });
});

describe('computeHomeNavbarChromeSurfaceOpacity', () => {
  const heroMin = 500;
  const fadeStart = heroMin - HOME_NAVBAR_CHROME_SURFACE_FADE_SCROLL_PX;

  it('returns 1 when hero anchor unknown', () => {
    expect(computeHomeNavbarChromeSurfaceOpacity(0, null, false)).toBe(1);
  });

  it('snaps opacity to fixed steps in fade zone', () => {
    const step = HOME_NAVBAR_CHROME_SURFACE_OPACITY_STEP;
    const midScroll = fadeStart + HOME_NAVBAR_CHROME_SURFACE_FADE_SCROLL_PX * 0.51;
    const o = computeHomeNavbarChromeSurfaceOpacity(midScroll, heroMin, false);
    const snapped = Math.round(o / step) * step;
    expect(o).toBeCloseTo(snapped, 10);
    expect(o).toBeGreaterThan(0);
    expect(o).toBeLessThan(1);
  });

  it('ignores sub-quantize scroll jitter (same scrollQ → same surface opacity)', () => {
    const base = fadeStart + 56;
    const sQuantized = Math.round(base / 4) * 4;
    expect(computeHomeNavbarChromeSurfaceOpacity(sQuantized, heroMin, false)).toBe(
      computeHomeNavbarChromeSurfaceOpacity(sQuantized + 1, heroMin, false)
    );
  });

  it('uses hard 0/1 when reduced motion', () => {
    expect(computeHomeNavbarChromeSurfaceOpacity(heroMin - 8, heroMin, true)).toBe(0);
    expect(computeHomeNavbarChromeSurfaceOpacity(heroMin + 8, heroMin, true)).toBe(1);
  });
});
