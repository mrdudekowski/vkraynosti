import { HOME_SECTION_CONTACT, HOME_SECTION_TEAM } from './routes';

/** Верх `#team` на этой доле viewport → fade-in progress 0. */
export const TEAM_ZONE_FADE_IN_START_SHARE = 0.95 as const;

/** Верх `#team` на этой доле viewport → fade-in progress 1. */
export const TEAM_ZONE_FADE_IN_END_SHARE = 0.42 as const;

/** Верх `#contact` на этой доле viewport → fade-out progress 1 (ещё полная штора). */
export const TEAM_ZONE_FADE_OUT_START_SHARE = 0.88 as const;

/** Верх `#contact` на этой доле viewport → fade-out progress 0. */
export const TEAM_ZONE_FADE_OUT_END_SHARE = 0.08 as const;

/** Квантование rect для стабильности при Lenis (как navbar chrome). */
export const TEAM_ZONE_SCROLL_QUANTIZE_PX = 4 as const;

/** Порог бинарной opacity при `prefers-reduced-motion`. */
export const TEAM_ZONE_REDUCED_MOTION_THRESHOLD = 0.5 as const;

export function quantizeTeamZoneScrollPx(value: number): number {
  const q = TEAM_ZONE_SCROLL_QUANTIZE_PX;
  return q > 0 ? Math.round(value / q) * q : value;
}

function clampUnitProgress(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/**
 * Fade-in по верхней границе `#team` (аналог `computeHomeScrollFadeProgress`).
 */
export function computeTeamZoneFadeInProgress(
  teamTopPx: number,
  viewportHeightPx: number
): number {
  if (viewportHeightPx <= 0) return 0;
  const startY = viewportHeightPx * TEAM_ZONE_FADE_IN_START_SHARE;
  const endY = viewportHeightPx * TEAM_ZONE_FADE_IN_END_SHARE;
  const denom = startY - endY;
  if (denom <= 0) return 1;
  const t = (startY - teamTopPx) / denom;
  return clampUnitProgress(t);
}

/**
 * Fade-out по верхней границе `#contact`: пока contact ниже start — 1, выше end — 0.
 */
export function computeTeamZoneFadeOutProgress(
  contactTopPx: number,
  viewportHeightPx: number
): number {
  if (viewportHeightPx <= 0) return 0;
  const startY = viewportHeightPx * TEAM_ZONE_FADE_OUT_START_SHARE;
  const endY = viewportHeightPx * TEAM_ZONE_FADE_OUT_END_SHARE;
  const denom = startY - endY;
  if (denom <= 0) return 0;
  const t = (contactTopPx - endY) / denom;
  return clampUnitProgress(t);
}

/**
 * Итоговая opacity шторы: `min(fadeIn, fadeOut)`.
 * Пока `#team` не вошёл — 0; в зоне команды — ≈1; при подъёме `#contact` — плавно к 0.
 */
export function computeTeamZoneBackdropProgress(
  teamSectionEl: HTMLElement | null,
  contactSectionEl: HTMLElement | null,
  viewportHeightPx: number
): number {
  if (viewportHeightPx <= 0 || teamSectionEl == null) return 0;

  const teamRect = teamSectionEl.getBoundingClientRect();
  const teamTop = quantizeTeamZoneScrollPx(teamRect.top);
  const fadeIn = computeTeamZoneFadeInProgress(teamTop, viewportHeightPx);

  if (contactSectionEl == null) {
    return fadeIn;
  }

  const contactTop = quantizeTeamZoneScrollPx(contactSectionEl.getBoundingClientRect().top);
  const fadeOut = computeTeamZoneFadeOutProgress(contactTop, viewportHeightPx);

  return Math.min(fadeIn, fadeOut);
}

/** Канонические id секций для querySelector без magic strings в UI. */
export function getHomeTeamSectionElement(): HTMLElement | null {
  return document.getElementById(HOME_SECTION_TEAM);
}

export function getHomeContactSectionElement(): HTMLElement | null {
  return document.getElementById(HOME_SECTION_CONTACT);
}
