/**
 * Scroll-scrub fade на главной: прогресс по положению верхней границы блока во вьюпорте.
 * Стили применяются из хука через inline style (без хардкода в JSX).
 */

/** Верх элемента на этой доле высоты viewport → прогресс 0 (нижняя граница зоны fade-in). */
export const HOME_SCROLL_FADE_TOP_START_SHARE = 0.92 as const;

/** Верх элемента на этой доле высоты viewport → прогресс 1. */
export const HOME_SCROLL_FADE_TOP_END_SHARE = 0.48 as const;

/** Ниже этого прогресса — `pointer-events: none` на обёртке. */
export const HOME_SCROLL_FADE_POINTER_EVENTS_MIN_PROGRESS = 0.05 as const;

/**
 * Смещение по Y при прогрессе 0 (в rem).
 * Должно совпадать с `theme.extend.spacing['reveal-y']` в tailwind.config.ts.
 */
export const HOME_SCROLL_FADE_TRANSLATE_Y_REM = 1.25 as const;

/**
 * @param topPx — `getBoundingClientRect().top` элемента-обёртки
 * @param viewportHeightPx — `window.innerHeight`
 */
export function computeHomeScrollFadeProgress(topPx: number, viewportHeightPx: number): number {
  if (viewportHeightPx <= 0) return 1;
  const startY = viewportHeightPx * HOME_SCROLL_FADE_TOP_START_SHARE;
  const endY = viewportHeightPx * HOME_SCROLL_FADE_TOP_END_SHARE;
  const denom = startY - endY;
  if (denom <= 0) return 1;
  const t = (startY - topPx) / denom;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}
