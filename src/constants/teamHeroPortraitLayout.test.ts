import { describe, expect, it } from 'vitest';
import {
  TEAM_HERO_DESKTOP_COLUMN_GAP,
  TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT,
  TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT,
  TEAM_HERO_SLIDE_MAX_WIDTH,
} from './teamHeroPortraitLayout';

describe('teamHeroPortraitLayout', () => {
  it('uses mobile portrait max-height', () => {
    expect(TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT).toBe('clamp(20rem, 52vh, 32rem)');
  });

  it('uses desktop portrait max-height', () => {
    expect(TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT).toBe('clamp(22rem, 62vh, 48rem)');
  });

  it('uses desktop column gap', () => {
    expect(TEAM_HERO_DESKTOP_COLUMN_GAP).toBe('1.5rem');
  });

  it('uses slide max-width for sm+ centering', () => {
    expect(TEAM_HERO_SLIDE_MAX_WIDTH).toBe('min(100%, 56rem)');
  });
});
