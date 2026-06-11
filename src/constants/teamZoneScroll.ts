import { HOME_TEAM_CONTACT_BRIDGE_SELECTOR } from './homeTeamContactBridge';
import { HOME_SECTION_CONTACT, HOME_SECTION_TEAM } from './routes';

/** Верх `#team` на этой доле viewport → fade-in progress 0. */
export const TEAM_ZONE_FADE_IN_START_SHARE = 0.95 as const;

/** Верх `#team` на этой доле viewport → fade-in progress 1. */
export const TEAM_ZONE_FADE_IN_END_SHARE = 0.42 as const;

/** Верх `#contact` на этой доле viewport → fade-out progress 1 (ещё полная штора). */
export const TEAM_ZONE_FADE_OUT_START_SHARE = 0.88 as const;

/** Верх `#contact` на этой доле viewport → fade-out progress 0. */
export const TEAM_ZONE_FADE_OUT_END_SHARE = 0.08 as const;

/** Верх bridge: штора ещё полная (ниже линии). Раньше contact — плавный стык team → знак. */
export const TEAM_ZONE_FADE_OUT_BRIDGE_START_SHARE = 0.92 as const;

/** Верх bridge: штора снята (выше линии). */
export const TEAM_ZONE_FADE_OUT_BRIDGE_END_SHARE = 0.48 as const;

/** Квантование rect для стабильности при Lenis (как navbar chrome). */
export const TEAM_ZONE_SCROLL_QUANTIZE_PX = 4 as const;

/** Порог бинарной opacity при `prefers-reduced-motion`. */
export const TEAM_ZONE_REDUCED_MOTION_THRESHOLD = 0.5 as const;

export function quantizeTeamZoneScrollPx(value: number): number {
  const q = TEAM_ZONE_SCROLL_QUANTIZE_PX;
  return q > 0 ? Math.round(value / q) * q : value;
}

/**
 * Высота viewport для расчёта progress: `visualViewport.height` (Android Chrome toolbar),
 * иначе `innerHeight` — как у соседних scroll-scrub хуков на главной.
 */
export function getTeamZoneViewportHeightPx(): number {
  if (typeof window === 'undefined') return 0;
  return window.visualViewport?.height ?? window.innerHeight;
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

function computeTeamZoneFadeOutProgressWithShares(
  sectionTopPx: number,
  viewportHeightPx: number,
  startShare: number,
  endShare: number
): number {
  if (viewportHeightPx <= 0) return 0;
  const startY = viewportHeightPx * startShare;
  const endY = viewportHeightPx * endShare;
  const denom = startY - endY;
  if (denom <= 0) return 0;
  const t = (sectionTopPx - endY) / denom;
  return clampUnitProgress(t);
}

/**
 * Fade-out по верхней границе `#contact`: пока contact ниже start — 1, выше end — 0.
 */
export function computeTeamZoneFadeOutProgress(
  contactTopPx: number,
  viewportHeightPx: number
): number {
  return computeTeamZoneFadeOutProgressWithShares(
    contactTopPx,
    viewportHeightPx,
    TEAM_ZONE_FADE_OUT_START_SHARE,
    TEAM_ZONE_FADE_OUT_END_SHARE
  );
}

/** Fade-out шторы при подъёме `HomeTeamContactBrandBridge` (стык team → логотип). */
export function computeTeamZoneBridgeFadeOutProgress(
  bridgeTopPx: number,
  viewportHeightPx: number
): number {
  return computeTeamZoneFadeOutProgressWithShares(
    bridgeTopPx,
    viewportHeightPx,
    TEAM_ZONE_FADE_OUT_BRIDGE_START_SHARE,
    TEAM_ZONE_FADE_OUT_BRIDGE_END_SHARE
  );
}

/**
 * Итоговая opacity шторы: `min(fadeIn, fadeOut)`.
 * Пока `#team` не вошёл — 0; в зоне команды — ≈1; при подъёме bridge/`#contact` — плавно к 0.
 */
export function computeTeamZoneBackdropProgress(
  teamSectionEl: HTMLElement | null,
  contactSectionEl: HTMLElement | null,
  viewportHeightPx: number,
  bridgeSectionEl: HTMLElement | null = null
): number {
  if (viewportHeightPx <= 0 || teamSectionEl == null) return 0;

  const teamRect = teamSectionEl.getBoundingClientRect();
  const teamTop = quantizeTeamZoneScrollPx(teamRect.top);
  const fadeIn = computeTeamZoneFadeInProgress(teamTop, viewportHeightPx);

  let fadeOut = 1;

  if (bridgeSectionEl != null) {
    const bridgeTop = quantizeTeamZoneScrollPx(bridgeSectionEl.getBoundingClientRect().top);
    fadeOut = Math.min(fadeOut, computeTeamZoneBridgeFadeOutProgress(bridgeTop, viewportHeightPx));
  }

  if (contactSectionEl != null) {
    const contactTop = quantizeTeamZoneScrollPx(contactSectionEl.getBoundingClientRect().top);
    fadeOut = Math.min(fadeOut, computeTeamZoneFadeOutProgress(contactTop, viewportHeightPx));
  }

  return Math.min(fadeIn, fadeOut);
}

/** Канонические id секций для querySelector без magic strings в UI. */
export function getHomeTeamSectionElement(): HTMLElement | null {
  return document.getElementById(HOME_SECTION_TEAM);
}

export function getHomeContactSectionElement(): HTMLElement | null {
  return document.getElementById(HOME_SECTION_CONTACT);
}

export function getHomeTeamContactBridgeElement(): HTMLElement | null {
  return document.querySelector(HOME_TEAM_CONTACT_BRIDGE_SELECTOR);
}
