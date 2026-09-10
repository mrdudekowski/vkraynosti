import { describe, expect, it } from 'vitest';
import {
  computeHomeHeroContactRailHideProgress,
  computeHomeHeroContactRailRevealProgress,
  HOME_HERO_CONTACT_RAIL_TOURS_HIDE_FADE_PX,
  HOME_HERO_CONTACT_RAIL_TOURS_HIDE_OFFSET_PX,
} from './homeHeroContactRail';

describe('computeHomeHeroContactRailHideProgress', () => {
  const navbar = 72;

  it('is 1 when tours top is at or above hide line', () => {
    const line = navbar + HOME_HERO_CONTACT_RAIL_TOURS_HIDE_OFFSET_PX;
    expect(computeHomeHeroContactRailHideProgress(line, navbar)).toBe(1);
    expect(computeHomeHeroContactRailHideProgress(line - 20, navbar)).toBe(1);
  });

  it('is 0 when tours top is below fade band', () => {
    const line = navbar + HOME_HERO_CONTACT_RAIL_TOURS_HIDE_OFFSET_PX;
    expect(
      computeHomeHeroContactRailHideProgress(
        line + HOME_HERO_CONTACT_RAIL_TOURS_HIDE_FADE_PX + 1,
        navbar
      )
    ).toBe(0);
  });

  it('interpolates within fade band', () => {
    const line = navbar + HOME_HERO_CONTACT_RAIL_TOURS_HIDE_OFFSET_PX;
    const mid = line + HOME_HERO_CONTACT_RAIL_TOURS_HIDE_FADE_PX / 2;
    expect(computeHomeHeroContactRailHideProgress(mid, navbar)).toBeCloseTo(0.5, 5);
  });
});

describe('computeHomeHeroContactRailRevealProgress', () => {
  it('multiplies chrome opacities and inverts hide', () => {
    expect(computeHomeHeroContactRailRevealProgress(1, 1, 0)).toBe(1);
    expect(computeHomeHeroContactRailRevealProgress(1, 0.5, 0)).toBe(0.5);
    expect(computeHomeHeroContactRailRevealProgress(1, 1, 1)).toBe(0);
    expect(computeHomeHeroContactRailRevealProgress(0, 1, 0)).toBe(0);
  });
});
