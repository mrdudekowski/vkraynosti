import { describe, expect, it } from 'vitest';
import { SEASON_ACCENT_HEX } from '../constants/seasonAccentHex';
import { THEME_TEXT_INVERSE_HEX } from '../constants/themeTextColors';
import { mixSrgbHex } from './mixSrgbHex';

describe('mixSrgbHex', () => {
  it('mixes winter accent 78% with surface.light 22%', () => {
    expect(
      mixSrgbHex(
        SEASON_ACCENT_HEX.winter,
        78,
        THEME_TEXT_INVERSE_HEX,
        22
      )
    ).toBe('#96b8c7');
  });

  it('normalizes percentages that do not sum to 100', () => {
    expect(mixSrgbHex('#000000', 39, '#ffffff', 11)).toBe(
      mixSrgbHex('#000000', 78, '#ffffff', 22)
    );
  });
});
