import { describe, expect, it } from 'vitest';
import {
  computeHomeNavbarEffectiveTopChromeOpacity,
  computeHomeNavbarTeamCenterHideProgress,
  HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE,
  homeNavbarChromeTeamHideShellClass,
} from './homeNavbarBridgeChrome';

const vh = 800;

describe('computeHomeNavbarTeamCenterHideProgress', () => {
  it('is 0 when team center is above threshold', () => {
    const teamCenter = vh * HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE + 40;
    expect(computeHomeNavbarTeamCenterHideProgress(teamCenter, vh)).toBe(0);
  });

  it('is 1 when team center is at or below threshold', () => {
    const teamCenter = vh * HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE;
    expect(computeHomeNavbarTeamCenterHideProgress(teamCenter, vh)).toBe(1);
  });

  it('is 1 when team center is below threshold', () => {
    const teamCenter = vh * HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE - 40;
    expect(computeHomeNavbarTeamCenterHideProgress(teamCenter, vh)).toBe(1);
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
    expect(computeHomeNavbarEffectiveTopChromeOpacity(1, 1)).toBe(0);
  });

  it('clamps inputs to unit interval', () => {
    expect(computeHomeNavbarEffectiveTopChromeOpacity(2, -0.2)).toBe(1);
    expect(computeHomeNavbarEffectiveTopChromeOpacity(1, 2)).toBe(0);
  });
});

describe('homeNavbarChromeTeamHideShellClass', () => {
  it('uses transition-opacity when motion is allowed', () => {
    expect(homeNavbarChromeTeamHideShellClass(false)).toContain('transition-opacity');
    expect(homeNavbarChromeTeamHideShellClass(false)).toContain('duration-home-navbar-chrome');
  });

  it('uses duration-0 when transition is disabled', () => {
    expect(homeNavbarChromeTeamHideShellClass(true)).toBe('duration-0');
  });
});
