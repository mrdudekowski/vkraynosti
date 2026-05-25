import { describe, expect, it } from 'vitest';
import { BREAKPOINT_TEAM_HERO_DESKTOP_PX } from './breakpoints';

describe('breakpoints', () => {
  it('uses team-hero desktop layout threshold at 650px', () => {
    expect(BREAKPOINT_TEAM_HERO_DESKTOP_PX).toBe(650);
  });
});
