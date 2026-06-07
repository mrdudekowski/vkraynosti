import { clamp01 } from './homeGateScroll';
import { TEAM_ZONE_SCROLL_QUANTIZE_PX } from './teamZoneScroll';

/** Квантование rect team — тот же шаг, что `teamZoneScroll` / navbar chrome. */
export { TEAM_ZONE_SCROLL_QUANTIZE_PX as HOME_NAVBAR_BRIDGE_SCROLL_QUANTIZE_PX };

/**
 * Центр `#team` на этой доле viewport и ниже → navbar скрыт (1).
 * Выше порога — navbar видим (0). Fade — CSS transition, не scroll-scrub.
 */
export const HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE = 0.7 as const;

/** @deprecated Используйте `HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE`. */
export const HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE = 0.88 as const;

/** @deprecated Используйте `HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE`. */
export const HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE = 0.52 as const;

/** @deprecated Используйте `HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE`. */
export const HOME_NAVBAR_TEAM_END_HIDE_START_SHARE = HOME_NAVBAR_TEAM_CENTER_HIDE_START_SHARE;
/** @deprecated Используйте `HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE`. */
export const HOME_NAVBAR_TEAM_END_HIDE_END_SHARE = HOME_NAVBAR_TEAM_CENTER_HIDE_END_SHARE;

/** Вертикальный центр секции «О команде» в координатах viewport. */
export function computeHomeTeamSectionCenterPx(rect: DOMRectReadOnly): number {
  return rect.top + rect.height / 2;
}

/**
 * Скрытие navbar по центру `#team`: 0 — видим; 1 — полностью скрыт (бинарный порог).
 */
export function computeHomeNavbarTeamCenterHideProgress(
  teamCenterPx: number,
  viewportHeightPx: number
): number {
  if (viewportHeightPx <= 0) return 0;
  const thresholdY = viewportHeightPx * HOME_NAVBAR_TEAM_CENTER_HIDE_THRESHOLD_SHARE;
  return teamCenterPx <= thresholdY ? 1 : 0;
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

/**
 * Класс внутренней оболочки team hide: CSS fade при пересечении порога (не scroll-linked).
 */
export function homeNavbarChromeTeamHideShellClass(disableTransition: boolean): string {
  return disableTransition
    ? 'duration-0'
    : 'transition-opacity duration-home-navbar-chrome ease-out';
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

  return computeHomeNavbarTeamCenterHideProgress(
    params.teamCenterPx,
    params.viewportHeightPx
  );
}
