import type { default as Lenis, LenisOptions } from 'lenis';

/**
 * Совпадает с Tailwind `md` по умолчанию (48rem).
 * Не дублировать порог в других местах — использовать этот импорт или `useMatchMinWidth`.
 */
export const BREAKPOINT_MD_PX = 768;

/**
 * Смещение для якорного скролла под фиксированный navbar (`h-16` = `spacing.navbar`).
 */
export const NAVBAR_SCROLL_OFFSET_PX = -64;

const shared: Pick<
  LenisOptions,
  'allowNestedScroll' | 'stopInertiaOnNavigate' | 'smoothWheel' | 'overscroll' | 'autoRaf'
> = {
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
  smoothWheel: true,
  overscroll: true,
  autoRaf: true,
};

/** Интерполяция позиции скролла (Lenis): меньше — плавнее и «вязче»; одинаково на десктопе и мобильных. */
const LENIS_ROOT_LERP = 0.075 as const;

const lenisRoot: LenisOptions = {
  ...shared,
  lerp: LENIS_ROOT_LERP,
  wheelMultiplier: 1,
  touchMultiplier: 1,
};

/** Один конфиг для всех ширин; ранее на мобильных был больший `lerp` (0.11) — сейчас та же плавность, что на десктопе. */
export function getLenisRootOptions(): LenisOptions {
  return lenisRoot;
}

export function scrollWindowToTopImmediate(lenis: Lenis | undefined): void {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}

export function scrollWindowToTopSmooth(lenis: Lenis | undefined): void {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollElementIntoViewAnchored(
  lenis: Lenis | undefined,
  element: HTMLElement,
  offsetPx: number
): void {
  if (lenis) lenis.scrollTo(element, { offset: offsetPx });
  else element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
