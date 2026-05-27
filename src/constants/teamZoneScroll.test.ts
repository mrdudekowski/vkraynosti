import { describe, expect, it } from 'vitest';
import {
  computeTeamZoneBackdropProgress,
  computeTeamZoneFadeInProgress,
  computeTeamZoneFadeOutProgress,
  TEAM_ZONE_FADE_IN_END_SHARE,
  TEAM_ZONE_FADE_IN_START_SHARE,
  TEAM_ZONE_FADE_OUT_BRIDGE_END_SHARE,
  TEAM_ZONE_FADE_OUT_BRIDGE_START_SHARE,
  TEAM_ZONE_FADE_OUT_END_SHARE,
  TEAM_ZONE_FADE_OUT_START_SHARE,
} from './teamZoneScroll';

describe('computeTeamZoneFadeInProgress', () => {
  const vh = 1000;

  it('is 0 when team top is at or below start line', () => {
    expect(computeTeamZoneFadeInProgress(vh * TEAM_ZONE_FADE_IN_START_SHARE, vh)).toBe(0);
    expect(computeTeamZoneFadeInProgress(vh * TEAM_ZONE_FADE_IN_START_SHARE + 40, vh)).toBe(0);
  });

  it('is 1 when team top is at or above end line', () => {
    expect(computeTeamZoneFadeInProgress(vh * TEAM_ZONE_FADE_IN_END_SHARE, vh)).toBe(1);
    expect(computeTeamZoneFadeInProgress(vh * TEAM_ZONE_FADE_IN_END_SHARE - 80, vh)).toBe(1);
  });

  it('interpolates between start and end', () => {
    const midTop = (vh * TEAM_ZONE_FADE_IN_START_SHARE + vh * TEAM_ZONE_FADE_IN_END_SHARE) / 2;
    expect(computeTeamZoneFadeInProgress(midTop, vh)).toBeCloseTo(0.5, 5);
  });
});

describe('computeTeamZoneFadeOutProgress', () => {
  const vh = 1000;

  it('is 1 when contact top is at or below start line', () => {
    expect(computeTeamZoneFadeOutProgress(vh * TEAM_ZONE_FADE_OUT_START_SHARE, vh)).toBe(1);
    expect(computeTeamZoneFadeOutProgress(vh * TEAM_ZONE_FADE_OUT_START_SHARE + 40, vh)).toBe(1);
  });

  it('is 0 when contact top is at or above end line', () => {
    expect(computeTeamZoneFadeOutProgress(vh * TEAM_ZONE_FADE_OUT_END_SHARE, vh)).toBe(0);
    expect(computeTeamZoneFadeOutProgress(vh * TEAM_ZONE_FADE_OUT_END_SHARE - 40, vh)).toBe(0);
  });

  it('interpolates between start and end', () => {
    const midTop = (vh * TEAM_ZONE_FADE_OUT_START_SHARE + vh * TEAM_ZONE_FADE_OUT_END_SHARE) / 2;
    expect(computeTeamZoneFadeOutProgress(midTop, vh)).toBeCloseTo(0.5, 5);
  });
});

describe('computeTeamZoneBackdropProgress', () => {
  const vh = 1000;

  function mockElement(rect: DOMRect): HTMLElement {
    return {
      getBoundingClientRect: () => rect,
    } as HTMLElement;
  }

  it('returns 0 before team enters fade-in zone', () => {
    const team = mockElement(new DOMRect(0, vh * TEAM_ZONE_FADE_IN_START_SHARE + 20, 0, 800));
    expect(computeTeamZoneBackdropProgress(team, null, vh)).toBe(0);
  });

  it('returns 1 when team is in zone and contact is below fade-out start', () => {
    const team = mockElement(new DOMRect(0, vh * TEAM_ZONE_FADE_IN_END_SHARE - 20, 0, 1200));
    const contact = mockElement(new DOMRect(0, vh * TEAM_ZONE_FADE_OUT_START_SHARE + 40, 0, 600));
    expect(computeTeamZoneBackdropProgress(team, contact, vh)).toBe(1);
  });

  it('fades out when bridge rises before contact reaches fade-out zone', () => {
    const team = mockElement(new DOMRect(0, -200, 0, 1200));
    const bridge = mockElement(
      new DOMRect(
        0,
        (vh * TEAM_ZONE_FADE_OUT_BRIDGE_START_SHARE + vh * TEAM_ZONE_FADE_OUT_BRIDGE_END_SHARE) /
          2,
        0,
        280
      )
    );
    const contact = mockElement(new DOMRect(0, vh * TEAM_ZONE_FADE_OUT_START_SHARE + 200, 0, 600));
    const progress = computeTeamZoneBackdropProgress(team, contact, vh, bridge);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
    expect(progress).toBeCloseTo(0.5, 5);
  });

  it('fades out as contact rises into viewport', () => {
    const team = mockElement(new DOMRect(0, -200, 0, 1200));
    const contactMid = mockElement(
      new DOMRect(0, (vh * TEAM_ZONE_FADE_OUT_START_SHARE + vh * TEAM_ZONE_FADE_OUT_END_SHARE) / 2, 0, 600)
    );
    const progress = computeTeamZoneBackdropProgress(team, contactMid, vh);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
    expect(progress).toBeCloseTo(0.5, 5);
  });

  it('returns 0 when contact fills upper viewport', () => {
    const team = mockElement(new DOMRect(0, -800, 0, 1200));
    const contact = mockElement(new DOMRect(0, vh * TEAM_ZONE_FADE_OUT_END_SHARE - 20, 0, 600));
    expect(computeTeamZoneBackdropProgress(team, contact, vh)).toBe(0);
  });

  it.each([
    { vh: 667, label: 'iPhone SE class' },
    { vh: 844, label: 'iPhone 12/13 class' },
    { vh: 932, label: 'iPhone 14 Pro Max class' },
  ])('fade-in spans ~53% viewport on mobile ($label, vh=$vh)', ({ vh }) => {
    const startY = vh * TEAM_ZONE_FADE_IN_START_SHARE;
    const endY = vh * TEAM_ZONE_FADE_IN_END_SHARE;
    const fadeSpanPx = startY - endY;
    expect(fadeSpanPx / vh).toBeCloseTo(0.53, 2);
    expect(computeTeamZoneBackdropProgress(mockElement(new DOMRect(0, startY + 8, 0, 800)), null, vh)).toBe(0);
    const midTop = Math.round((startY + endY) / 2);
    expect(computeTeamZoneFadeInProgress(midTop, vh)).toBeCloseTo(0.5, 2);
    expect(computeTeamZoneFadeInProgress(endY - 16, vh)).toBe(1);
  });
});
