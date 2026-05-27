import { clamp01 } from './homeGateScroll';
import { HOME_NAVBAR_CHROME_SURFACE_OPACITY_STEP } from './homeNavbarChrome';
import {
  TEAM_ZONE_REDUCED_MOTION_THRESHOLD,
  TEAM_ZONE_SCROLL_QUANTIZE_PX,
} from './teamZoneScroll';

/** Квантование rect team — тот же шаг, что `teamZoneScroll` / navbar chrome. */
export { TEAM_ZONE_SCROLL_QUANTIZE_PX as HOME_NAVBAR_BRIDGE_SCROLL_QUANTIZE_PX };

/**
 * Центр `#team` на этой доле viewport → navbar hide 0 (ещё в середине секции).
 * Выше по скроллу — начало fade-out.
 */
export const HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE = 0.88 as const;

/** Центр `#team` на этой доле viewport → navbar hide 1. */
export const HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE = 0.52 as const;

/** @deprecated Используйте `HOME_NAVBAR_TEAM_CENTER_HIDE_*`. */
export const HOME_NAVBAR_TEAM_END_HIDE_START_SHARE = HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE;
/** @deprecated Используйте `HOME_NAVBAR_TEAM_CENTER_HIDE_*`. */
export const HOME_NAVBAR_TEAM_END_HIDE_END_SHARE = HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE;

/** Вертикальный центр секции «О команде» в координатах viewport. */
export function computeHomeTeamSectionCenterPx(rect: DOMRectReadOnly): number {
  return rect.top + rect.height / 2;
}

/**
 * Скрытие navbar по центру `#team`: 0 — видим; 1 — полностью скрыт.
 */
export function computeHomeNavbarTeamCenterHideProgress(
  teamCenterPx: number,
  viewportHeightPx: number
): number {
  if (viewportHeightPx <= 0) return 0;
  const startY = viewportHeightPx * HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE;
  const endY = viewportHeightPx * HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE;
  const denom = startY - endY;
  if (denom <= 0) return 0;
  if (teamCenterPx >= startY) return 0;
  if (teamCenterPx <= endY) return 1;
  const t = (startY - teamCenterPx) / denom;
  return clamp01(t);
}

/** @deprecated Используйте `computeHomeNavbarTeamCenterHideProgress`. */
export function computeHomeNavbarTeamEndHideProgress(
  teamCenterPx: number,
  viewportHeightPx: number
): number {
  return computeHomeNavbarTeamCenterHideProgress(teamCenterPx, viewportHeightPx);
}

/** @deprecated Имя поля snap — `bridgeHideProgress`; якорь — центр `#team`. */
export function computeHomeNavbarBridgeHideProgress(
  teamCenterPx: number,
  viewportHeightPx: number
): number {
  return computeHomeNavbarTeamCenterHideProgress(teamCenterPx, viewportHeightPx);
}

export function computeHomeNavbarEffectiveTopChromeOpacity(
  topChromeOpacity: number,
  bridgeHideProgress: number
): number {
  return clamp01(clamp01(topChromeOpacity) * (1 - clamp01(bridgeHideProgress)));
}

export function quantizeHomeNavbarBridgeHideProgress(value: number): number {
  const step = HOME_NAVBAR_CHROME_SURFACE_OPACITY_STEP;
  if (step <= 0) return clamp01(value);
  return clamp01(Math.round(clamp01(value) / step) * step);
}

export interface ResolveHomeNavbarBridgeHideProgressParams {
  teamCenterPx: number | null;
  viewportHeightPx: number;
  topChromeOpacity: number;
  reducedMotion: boolean;
}

/**
 * Снимок hide для контекста: только после hero и при известном центре `#team`.
 * Вызывается из `useTeamZoneViewportBackdrop` (тот же rAF, что штора).
 */
export function resolveHomeNavbarBridgeHideProgress(
  params: ResolveHomeNavbarBridgeHideProgressParams
): number {
  if (params.topChromeOpacity <= 0) return 0;
  if (params.teamCenterPx == null || params.viewportHeightPx <= 0) return 0;

  let hide = computeHomeNavbarTeamCenterHideProgress(
    params.teamCenterPx,
    params.viewportHeightPx
  );

  if (params.reducedMotion) {
    hide = hide >= TEAM_ZONE_REDUCED_MOTION_THRESHOLD ? 1 : 0;
  }

  return quantizeHomeNavbarBridgeHideProgress(hide);
}
