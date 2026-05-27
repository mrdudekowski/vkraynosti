import { describe, expect, it } from 'vitest';
import type { Config } from 'tailwindcss';
import tailwindConfig from '../../tailwind.config';
import {
  BREAKPOINT_MOBILE_NAV_DRAWER_COMPACT_PX,
  BREAKPOINT_NAV_DESKTOP_PX,
  BREAKPOINT_TEAM_HERO_DESKTOP_PX,
  TAILWIND_SCREEN_MAX_WIDTH_PX,
  TAILWIND_SCREEN_MIN_WIDTH_PX,
  type TailwindMaxScreenName,
  type TailwindMinScreenName,
} from './breakpoints';

type ScreenValue = string | { min?: string; max?: string };

function parsePx(value: string): number {
  const match = /^(\d+)px$/.exec(value.trim());
  if (!match) {
    throw new Error(`Expected Npx, got "${value}"`);
  }
  return Number.parseInt(match[1], 10);
}

function getThemeScreens(config: Config): Record<string, ScreenValue> {
  const theme = config.theme;
  const extend = theme && typeof theme === 'object' && 'extend' in theme ? theme.extend : undefined;
  const extendScreens =
    extend && typeof extend === 'object' && extend !== null && 'screens' in extend
      ? extend.screens
      : undefined;
  if (!extendScreens || typeof extendScreens !== 'object') {
    throw new Error('tailwind.config: theme.extend.screens missing');
  }
  return extendScreens as Record<string, ScreenValue>;
}

describe('breakpoints', () => {
  it('uses team-hero desktop layout threshold at 650px', () => {
    expect(BREAKPOINT_TEAM_HERO_DESKTOP_PX).toBe(650);
  });

  it('uses mobile nav drawer compact threshold at 640px', () => {
    expect(BREAKPOINT_MOBILE_NAV_DRAWER_COMPACT_PX).toBe(640);
  });

  it('uses nav-desktop threshold at 950px', () => {
    expect(BREAKPOINT_NAV_DESKTOP_PX).toBe(950);
  });
});

describe('breakpoints ↔ tailwind theme.extend.screens', () => {
  const screens = getThemeScreens(tailwindConfig as Config);

  it('min-width screens match TAILWIND_SCREEN_MIN_WIDTH_PX', () => {
    for (const name of Object.keys(TAILWIND_SCREEN_MIN_WIDTH_PX) as TailwindMinScreenName[]) {
      const expectedPx = TAILWIND_SCREEN_MIN_WIDTH_PX[name];
      const raw = screens[name];
      expect(raw, `screen "${name}" missing in tailwind.config`).toBeDefined();
      expect(typeof raw).toBe('string');
      expect(parsePx(raw as string)).toBe(expectedPx);
    }
  });

  it('max-width screens match TAILWIND_SCREEN_MAX_WIDTH_PX', () => {
    for (const name of Object.keys(TAILWIND_SCREEN_MAX_WIDTH_PX) as TailwindMaxScreenName[]) {
      const expectedPx = TAILWIND_SCREEN_MAX_WIDTH_PX[name];
      const raw = screens[name];
      expect(raw, `screen "${name}" missing in tailwind.config`).toBeDefined();
      expect(raw).toEqual({ max: `${expectedPx}px` });
    }
  });

  it('does not define extra extend.screens beyond SSOT maps', () => {
    const allowed = new Set([
      ...Object.keys(TAILWIND_SCREEN_MIN_WIDTH_PX),
      ...Object.keys(TAILWIND_SCREEN_MAX_WIDTH_PX),
    ]);
    expect(new Set(Object.keys(screens))).toEqual(allowed);
  });
});
