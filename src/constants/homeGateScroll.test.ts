import { describe, expect, it } from 'vitest';
import {
  computeHomeGatePortalReturnVeilOpacity,
  computeHomeGateScrollHintVisible,
  HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX,
} from './homeGateScroll';

describe('computeHomeGatePortalReturnVeilOpacity', () => {
  const heroMin = 800;

  it('returns 0 when not scrolling up', () => {
    expect(computeHomeGatePortalReturnVeilOpacity(heroMin + 100, heroMin, 1)).toBe(0);
    expect(computeHomeGatePortalReturnVeilOpacity(heroMin + 100, heroMin, 0)).toBe(0);
  });

  it('returns 0 at or before hero anchor', () => {
    expect(computeHomeGatePortalReturnVeilOpacity(heroMin, heroMin, -1)).toBe(0);
    expect(computeHomeGatePortalReturnVeilOpacity(heroMin + 2, heroMin, -1)).toBe(0);
  });

  it('returns 0 at or past ramp end', () => {
    expect(computeHomeGatePortalReturnVeilOpacity(heroMin + 420, heroMin, -1)).toBe(0);
    expect(computeHomeGatePortalReturnVeilOpacity(heroMin + 500, heroMin, -1)).toBe(0);
  });

  it('ramps in the band above heroMin when scrolling up', () => {
    const mid = heroMin + 210;
    const o = computeHomeGatePortalReturnVeilOpacity(mid, heroMin, -1);
    expect(o).toBeGreaterThan(0);
    expect(o).toBeLessThanOrEqual(0.36);
  });
});

describe('computeHomeGateScrollHintVisible', () => {
  const max = HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX;

  it('is true at scroll 0', () => {
    expect(computeHomeGateScrollHintVisible(0, max)).toBe(true);
  });

  it('is true at threshold', () => {
    expect(computeHomeGateScrollHintVisible(max, max)).toBe(true);
  });

  it('is false just above threshold', () => {
    expect(computeHomeGateScrollHintVisible(max + 0.1, max)).toBe(false);
  });
});
