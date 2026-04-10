import type { default as Lenis, LenisOptions } from 'lenis';
import { HOME_HERO_SECTION_ELEMENT_ID } from './homeHeroSnap';

// Скролл: Lenis в `SmoothScrollProvider`; chrome главной — `useHomeNavbarChromeScroll` + контекст.

/**
 * Совпадает с Tailwind `md` по умолчанию (48rem).
 * Не дублировать порог в других местах — использовать этот импорт или `useMatchMinWidth`.
 */
export const BREAKPOINT_MD_PX = 768;

/**
 * Смещение для якоря под фиксированный navbar (`h-16` = `spacing.navbar`).
 * Верх контента (например секции `#home-hero`) совмещается с нижней кромкой навбара — «второй потолок» вьюпорта.
 */
export const NAVBAR_SCROLL_OFFSET_PX = -64;

/** `false` — без Lenis, нативный скролл (локальная отладка). В проде держать `true`. */
export const SMOOTH_SCROLL_ENABLED = true as const;

/** Lenis: плавное колесо по умолчанию на всём сайте (без программных фаз скролла). */
const LENIS_SMOOTH_WHEEL_INITIAL = true as const;

const shared: Pick<
  LenisOptions,
  'allowNestedScroll' | 'stopInertiaOnNavigate' | 'smoothWheel' | 'overscroll' | 'autoRaf'
> = {
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
  smoothWheel: LENIS_SMOOTH_WHEEL_INITIAL,
  overscroll: true,
  /**
   * Кадр Lenis драйвится из `SmoothScrollProvider` через `useAnimationFrame` (Motion).
   */
  autoRaf: false,
};

/** Интерполяция позиции скролла (Lenis): меньше — плавнее и «вязче»; одинаково на десктопе и мобильных. */
const LENIS_ROOT_LERP = 0.075 as const;

const lenisRoot: LenisOptions = {
  ...shared,
  lerp: LENIS_ROOT_LERP,
  wheelMultiplier: 1,
  touchMultiplier: 1,
};

/** Один конфиг для всех ширин; RAF синхронизирован с Motion в `SmoothScrollProvider`. */
export function getLenisRootOptions(): LenisOptions {
  return lenisRoot;
}

/** Позиция скролла: Lenis при включённом smooth scroll, иначе `window.scrollY`. */
export function getViewportScrollY(lenis: Pick<Lenis, 'scroll'> | undefined | null): number {
  return lenis?.scroll ?? window.scrollY;
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

/**
 * Минимальный `lenis.scroll`, при котором верх секции `#home-hero` совпадает с линией под фиксированным навбаром.
 */
export function computeHomeHeroMinScrollY(
  lenisScroll: number,
  heroSection: HTMLElement | null
): number | null {
  if (!heroSection) return null;
  const rect = heroSection.getBoundingClientRect();
  return lenisScroll + rect.top + NAVBAR_SCROLL_OFFSET_PX;
}

/** Главная: к секции hero, верх под навбаром. */
export function scrollHomeHeroTopSmooth(lenis: Lenis | undefined): void {
  const section = document.getElementById(HOME_HERO_SECTION_ELEMENT_ID);
  if (lenis && section) {
    lenis.scrollTo(section, { offset: NAVBAR_SCROLL_OFFSET_PX });
  } else if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function scrollHomeHeroTopImmediate(lenis: Lenis | undefined): void {
  const section = document.getElementById(HOME_HERO_SECTION_ELEMENT_ID);
  if (lenis && section) {
    lenis.scrollTo(section, { offset: NAVBAR_SCROLL_OFFSET_PX, immediate: true });
  } else if (section) {
    section.scrollIntoView({ block: 'start' });
  }
}

