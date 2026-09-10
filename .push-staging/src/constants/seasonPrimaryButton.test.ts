import { describe, expect, it } from 'vitest';
import type { Season } from '../types';
import { contrastRatio, relativeLuminance } from '../utils/colorContrast';
import { SEASON_ACCENT_HEX } from './seasonAccentHex';
import { THEME_TEXT_INVERSE_HEX, THEME_TEXT_PRIMARY_HEX } from './themeTextColors';
import {
  BTN_PRIMARY_SURFACE_DARK_HEX,
  pickBtnPrimaryTextOnFill,
  SEASON_PRIMARY_BTN_FILL_HEX,
  SEASON_PRIMARY_BTN_FG_HEX,
} from './seasonPrimaryButton';

const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

const WCAG_AA_CONTRAST_MIN = 4.5;

const ALLOWED_BTN_PRIMARY_FG: ReadonlySet<string> = new Set([
  THEME_TEXT_PRIMARY_HEX,
  BTN_PRIMARY_SURFACE_DARK_HEX,
  THEME_TEXT_INVERSE_HEX,
]);

describe('seasonPrimaryButton', () => {
  it.each(SEASONS)('%s fill is lighter than raw accent', season => {
    expect(relativeLuminance(SEASON_PRIMARY_BTN_FILL_HEX[season])).toBeGreaterThan(
      relativeLuminance(SEASON_ACCENT_HEX[season])
    );
  });

  it.each(SEASONS)('%s fg is pickBtnPrimaryTextOnFill(fill)', season => {
    expect(SEASON_PRIMARY_BTN_FG_HEX[season]).toBe(
      pickBtnPrimaryTextOnFill(SEASON_PRIMARY_BTN_FILL_HEX[season])
    );
  });

  it.each(SEASONS)('%s fill/fg meets WCAG AA (≥ 4.5:1)', season => {
    const ratio = contrastRatio(
      SEASON_PRIMARY_BTN_FG_HEX[season],
      SEASON_PRIMARY_BTN_FILL_HEX[season]
    );
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_CONTRAST_MIN);
  });

  it.each(SEASONS)('%s fg uses only theme text tokens', season => {
    const fg: string = SEASON_PRIMARY_BTN_FG_HEX[season];
    expect(ALLOWED_BTN_PRIMARY_FG.has(fg)).toBe(true);
    expect(SEASON_PRIMARY_BTN_FG_HEX[season]).not.toBe('#000000');
    expect(SEASON_PRIMARY_BTN_FG_HEX[season]).not.toBe('#FFFFFF');
  });

  it.each(SEASONS)('%s fg is at least 93%% of best theme-token contrast', season => {
    const bg = SEASON_PRIMARY_BTN_FILL_HEX[season];
    const chosen = contrastRatio(SEASON_PRIMARY_BTN_FG_HEX[season], bg);
    const best = Math.max(
      contrastRatio(THEME_TEXT_INVERSE_HEX, bg),
      contrastRatio(THEME_TEXT_PRIMARY_HEX, bg),
      contrastRatio(BTN_PRIMARY_SURFACE_DARK_HEX, bg)
    );
    expect(chosen).toBeGreaterThanOrEqual(best * 0.93);
  });
});
