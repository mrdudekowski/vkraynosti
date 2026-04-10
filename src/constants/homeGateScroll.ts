/**
 * Пороги IntersectionObserver стадии ворот на главной (фокус баннера).
 *
 * Связанные модули: `useHomeNavbarChromeScroll`, `smoothScroll`.
 */

export const HOME_GATE_STAGE_INTERSECT_ENTER = 0.14;

/**
 * Гистерезис выхода: ниже этой доли `intersectionRatio` — ворота «не в фокусе».
 * Должно быть меньше `HOME_GATE_STAGE_INTERSECT_ENTER`.
 */
export const HOME_GATE_STAGE_INTERSECT_LEAVE = 0.06;

/** Пороги для одного `IntersectionObserver` (уникальные, по возрастанию). */
export function homeGateStageIntersectThresholds(): number[] {
  return Array.from(
    new Set([0, HOME_GATE_STAGE_INTERSECT_LEAVE, HOME_GATE_STAGE_INTERSECT_ENTER, 1])
  ).sort((a, b) => a - b);
}

/** Доля видимой высоты элемента относительно его `height` (первый кадр без IO). */
export function homeGateStageVisibleHeightShare(rect: DOMRectReadOnly, viewportHeight: number): number {
  const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  return visibleHeight / Math.max(rect.height, 1);
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Длина участка (px) для fade вуали над `heroMin` при скролле вверх. */
export const HOME_GATE_RETURN_VEIL_RAMP_SCROLL_PX = 420 as const;

/**
 * Базовая непрозрачность вуали при возврате из hero к воротам (тесты и возможный UI).
 * `direction` — 1 вниз, -1 вверх, 0 неизвестно.
 */

export function computeHomeGatePortalReturnVeilOpacity(
  scrollY: number,
  heroMinScrollY: number,
  direction: 1 | -1 | 0
): number {
  if (direction !== -1) return 0;
  if (scrollY <= heroMinScrollY + 2) return 0;
  const rampEnd = heroMinScrollY + HOME_GATE_RETURN_VEIL_RAMP_SCROLL_PX;
  if (scrollY >= rampEnd) return 0;
  const t = (scrollY - heroMinScrollY) / (rampEnd - heroMinScrollY);
  const x = clamp01(t);
  return 0.36 * (1 - x) * (1 - x);
}
