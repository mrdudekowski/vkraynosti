import { describe, expect, it } from 'vitest';
import {
  computeHomeNavbarEffectiveTopChromeOpacity,
  computeHomeNavbarTeamCenterHideProgress,
  HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE,
  HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE,
} from './homeNavbarBridgeChrome';

const vh = 800;

describe('computeHomeNavbarTeamCenterHideProgress', () => {
  it('is 0 when team center is below fade band', () => {
    const teamCenter = vh * HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE + 40;
    expect(computeHomeNavbarTeamCenterHideProgress(teamCenter, vh)).toBe(0);
  });

  it('is 1 when team center rose above fade band', () => {
    const teamCenter = vh * HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE - 40;
    expect(computeHomeNavbarTeamCenterHideProgress(teamCenter, vh)).toBe(1);
  });

  it('is ~0.5 at midpoint of team-center fade band', () => {
    const teamCenter =
      (vh * HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE +
        vh * HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE) /
      2;
    expect(computeHomeNavbarTeamCenterHideProgress(teamCenter, vh)).toBeCloseTo(0.5, 5);
  });

  it('increases monotonically as team center moves up', () => {
    const low = computeHomeNavbarTeamCenterHideProgress(vh * 0.95, vh);
    const mid = computeHomeNavbarTeamCenterHideProgress(vh * 0.7, vh);
    const high = computeHomeNavbarTeamCenterHideProgress(vh * 0.4, vh);
    expect(low).toBeLessThan(mid);
    expect(mid).toBeLessThan(high);
  });

  it('returns 0 for non-positive viewport height', () => {
    expect(computeHomeNavbarTeamCenterHideProgress(400, 0)).toBe(0);
  });
});

describe('computeHomeNavbarEffectiveTopChromeOpacity', () => {
  it('returns topChromeOpacity when team-center hide is 0', () => {
    expect(computeHomeNavbarEffectiveTopChromeOpacity(1, 0)).toBe(1);
    expect(computeHomeNavbarEffectiveTopChromeOpacity(0, 0)).toBe(0);
  });

  it('multiplies top chrome by (1 - hide progress)', () => {
    expect(computeHomeNavbarEffectiveTopChromeOpacity(1, 0.5)).toBe(0.5);
    expect(computeHomeNavbarEffectiveTopChromeOpacity(1, 1)).toBe(0);
  });

  it('clamps inputs to unit interval', () => {
    expect(computeHomeNavbarEffectiveTopChromeOpacity(2, -0.2)).toBe(1);
    expect(computeHomeNavbarEffectiveTopChromeOpacity(1, 2)).toBe(0);
  });
});
