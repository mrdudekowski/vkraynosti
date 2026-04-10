/**
 * Параллакс фона «неба» на главной: сдвиг translateY пропорционально scrollY.
 * Синхронизация со скроллом — `getViewportScrollY` + хук `useHomeSkyParallax`.
 */

/** Доля `scrollY`, на которую сдвигается внутренний слой градиента (0…1). */
export const HOME_SKY_PARALLAX_SCROLL_FACTOR = 0.18 as const;

export function computeParallaxTranslateYPx(scrollYPx: number, factor: number): number {
  if (!Number.isFinite(scrollYPx) || !Number.isFinite(factor)) return 0;
  return scrollYPx * factor;
}
