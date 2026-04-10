import { describe, expect, it } from 'vitest';
import { computeHomeGatePortalReturnVeilOpacity } from './homeGateScroll';

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
