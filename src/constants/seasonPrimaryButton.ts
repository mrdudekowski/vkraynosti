import type { Season } from '../types';
import { contrastRatio } from '../utils/colorContrast';
import { mixSrgbHex } from '../utils/mixSrgbHex';
import { SEASON_ACCENT_HEX } from './seasonAccentHex';
import { THEME_TEXT_INVERSE_HEX, THEME_TEXT_PRIMARY_HEX } from './themeTextColors';

/** Как `colors.surface.dark` — предпочтительный тёмный текст на кнопке. */
export const BTN_PRIMARY_SURFACE_DARK_HEX = '#0D0D0D' as const;

/** Доля акцента в заливке `.btn-primary` (`color-mix` с `SEASON_PRIMARY_BTN_FILL_SURFACE_HEX`). */
export const SEASON_PRIMARY_BTN_FILL_MIX_ACCENT_PCT = 78 as const;

/** Доля `surface.light` в заливке `.btn-primary`. */
export const SEASON_PRIMARY_BTN_FILL_MIX_SURFACE_PCT = 22 as const;

/** Синхронно с `colors.surface.light` / `THEME_TEXT_INVERSE_HEX`. */
export const SEASON_PRIMARY_BTN_FILL_SURFACE_HEX = THEME_TEXT_INVERSE_HEX;

const SEASONS: Season[] = ['winter', 'spring', 'summer', 'fall'];

const BTN_PRIMARY_FG_CANDIDATES_DARK = [
  BTN_PRIMARY_SURFACE_DARK_HEX,
  THEME_TEXT_PRIMARY_HEX,
] as const;

const BTN_PRIMARY_FG_CANDIDATES_LIGHT = [THEME_TEXT_INVERSE_HEX] as const;

const PREFERRED_FG_CONTRAST_RATIO = 0.93;

function buildSeasonPrimaryBtnFillHex(): Record<Season, string> {
  const fills = {} as Record<Season, string>;
  for (const season of SEASONS) {
    fills[season] = mixSrgbHex(
      SEASON_ACCENT_HEX[season],
      SEASON_PRIMARY_BTN_FILL_MIX_ACCENT_PCT,
      SEASON_PRIMARY_BTN_FILL_SURFACE_HEX,
      SEASON_PRIMARY_BTN_FILL_MIX_SURFACE_PCT
    );
  }
  return fills;
}

const WCAG_AA_CONTRAST_MIN = 4.5;

function pickFromCandidatePool(
  pool: readonly string[],
  fillHex: string
): string {
  let maxRatio = 0;
  for (const candidate of pool) {
    maxRatio = Math.max(maxRatio, contrastRatio(candidate, fillHex));
  }

  for (const candidate of pool) {
    if (contrastRatio(candidate, fillHex) >= maxRatio * PREFERRED_FG_CONTRAST_RATIO) {
      return candidate;
    }
  }

  let best = pool[0];
  let bestRatio = 0;
  for (const candidate of pool) {
    const ratio = contrastRatio(candidate, fillHex);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return best;
}

/**
 * Текст `.btn-primary` на смягчённой заливке: только `text.primary` / `surface.dark` / `text.inverse`.
 */
export function pickBtnPrimaryTextOnFill(fillHex: string): string {
  const darkChoice = pickFromCandidatePool(BTN_PRIMARY_FG_CANDIDATES_DARK, fillHex);
  if (contrastRatio(darkChoice, fillHex) >= WCAG_AA_CONTRAST_MIN) {
    return darkChoice;
  }
  return pickFromCandidatePool(BTN_PRIMARY_FG_CANDIDATES_LIGHT, fillHex);
}

/**
 * Смягчённая заливка `.btn-primary` (78% accent + 22% surface.light).
 * Иконки сезона — `SEASON_ACCENT_HEX` / `colors.season.*`, не этот токен.
 */
export const SEASON_PRIMARY_BTN_FILL_HEX = buildSeasonPrimaryBtnFillHex();

/** Текст `.btn-primary` на fill сезона (см. `seasonPrimaryButton.test.ts`). */
export const SEASON_PRIMARY_BTN_FG_HEX = Object.fromEntries(
  SEASONS.map(season => [
    season,
    pickBtnPrimaryTextOnFill(SEASON_PRIMARY_BTN_FILL_HEX[season]),
  ])
) as Record<Season, string>;
