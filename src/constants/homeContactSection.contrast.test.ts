import { describe, expect, it } from 'vitest';
import { contrastRatio, parseHexColor } from '../utils/colorContrast';
import { HOME_CONTACT_SECTION_BG_HEX } from './homeContactSection';
import { THEME_TEXT_PRIMARY_HEX } from './themeTextColors';

/** WCAG 2.1 AA: обычный текст. */
const WCAG_AA_NORMAL_TEXT_MIN = 4.5;

/** WCAG 2.1 AA: крупный текст (`.section-title` / `text-section`). */
const WCAG_AA_LARGE_TEXT_MIN = 3;

function blendHexOnBackground(
  foregroundHex: string,
  backgroundHex: string,
  foregroundOpacity: number,
): string {
  const [fr, fg, fb] = parseHexColor(foregroundHex);
  const [br, bg, bb] = parseHexColor(backgroundHex);
  const mix = (f: number, b: number) =>
    Math.round(f * foregroundOpacity + b * (1 - foregroundOpacity));
  const r = mix(fr, br);
  const g = mix(fg, bg);
  const b = mix(fb, bb);
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

describe('homeContactSection contrast', () => {
  it('text-text-primary on bg-home-contact-section meets AA for large title', () => {
    const ratio = contrastRatio(THEME_TEXT_PRIMARY_HEX, HOME_CONTACT_SECTION_BG_HEX);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT_MIN);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_MIN);
  });

  it('subtitle text-text-primary/85 on section background meets AA normal text', () => {
    const blended = blendHexOnBackground(THEME_TEXT_PRIMARY_HEX, HOME_CONTACT_SECTION_BG_HEX, 0.85);
    const ratio = contrastRatio(blended, HOME_CONTACT_SECTION_BG_HEX);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT_MIN);
  });
});
