/**
 * Chrome главной: на зоне ворот (`scroll` до якоря hero) — сплошной чёрный фон под навбаром/доком
 * (`gateStageFullBleedMinHeight`); непрозрачность поверхностного слоя по-прежнему растёт к hero.
 */

import { clamp01 } from './homeGateScroll';
import { ROUTES } from './routes';

/** Снимок для Layout / Navbar / дока (главная). */
export interface HomeNavbarChromeSnap {
  /**
   * Главная: 0 до якоря hero по квантованному скроллу (как `heroMinScrollY`); 1 когда `scroll` достиг
   * якоря — без IntersectionObserver, чтобы не рассинхронизироваться со сглаженным Lenis.
   */
  topChromeOpacity: number;
  /** Непрозрачность слоя фона под контентом (0 — только контент поверх сцены). */
  topChromeSurfaceOpacity: number;
  /** `true` → `pt-16` у `main` на не-главных маршрутах; на главной `main` без отступа (оверлей navbar). */
  mainUsesNavbarTopPadding: boolean;
  /** Зона ворот: под навбаром/доком непрозрачный слой `bg-home-gate-start-screen` (как у старта). */
  gateStageFullBleedMinHeight: boolean;
  /** Без transition opacity у фона (`prefers-reduced-motion`). */
  disableTopChromeTransition: boolean;
}

/** Длительность opacity transition фона навбара/дока (ms); синхронно с `duration-home-navbar-chrome`. */
export const HOME_NAVBAR_CHROME_TRANSITION_MS = 320;

/** Полоса скролла (px): интерполяция `topChromeSurfaceOpacity` 0 → 1 перед `heroMinScrollY`. */
export const HOME_NAVBAR_CHROME_SURFACE_FADE_SCROLL_PX = 140;

/**
 * Квантование `scroll` (px) при расчёте opacity фона — меньше «ряби» у Lenis.
 */
export const HOME_NAVBAR_CHROME_SCROLL_QUANTIZE_PX = 4;

/** Шаг `topChromeSurfaceOpacity` в зоне fade — меньше лишних коммитов при сглаженном скролле. */
export const HOME_NAVBAR_CHROME_SURFACE_OPACITY_STEP = 0.05 as const;

/** Стабилизирует позицию скролла и якорь hero — без дрожания `heroMin` от субпикселя Lenis. */
export function quantizeAxisPxForHomeNavbarChrome(value: number): number {
  const q = HOME_NAVBAR_CHROME_SCROLL_QUANTIZE_PX;
  return q > 0 ? Math.round(value / q) * q : value;
}

export interface ComputeHomeNavbarChromeParams {
  enabled: boolean;
  scroll: number;
  heroMinScrollY: number | null;
  reducedMotion: boolean;
}

/** Дефолт для не-главной и отключённого хука — полный chrome. */
export const HOME_NAVBAR_CHROME_LAYOUT_DEFAULT: HomeNavbarChromeSnap = {
  topChromeOpacity: 1,
  topChromeSurfaceOpacity: 1,
  mainUsesNavbarTopPadding: true,
  gateStageFullBleedMinHeight: false,
  disableTopChromeTransition: false,
};

/**
 * Первый кадр: на главной — навбар невидим, пока `useHomeNavbarChromeScroll` не опубликует снимок.
 */
function spaPathWithoutRouterBasename(pathname: string): string {
  const raw = pathname.replace(/\/$/, '') || '/';
  let base = import.meta.env.BASE_URL;
  if (!base.endsWith('/')) base = `${base}/`;
  const baseNoTrail = base.replace(/\/$/, '') || '';
  if (!baseNoTrail || baseNoTrail === '/') return raw;
  if (raw === baseNoTrail) return ROUTES.HOME;
  if (raw.startsWith(`${baseNoTrail}/`)) {
    const rest = raw.slice(baseNoTrail.length);
    return rest || ROUTES.HOME;
  }
  return raw;
}

export function readInitialHomeNavbarChromeSnap(): HomeNavbarChromeSnap {
  if (typeof window === 'undefined') {
    return { ...HOME_NAVBAR_CHROME_LAYOUT_DEFAULT };
  }
  const path = spaPathWithoutRouterBasename(window.location.pathname);
  const isProbablyHome = path === ROUTES.HOME || path === '';
  if (isProbablyHome) {
    return {
      ...HOME_NAVBAR_CHROME_LAYOUT_DEFAULT,
      topChromeOpacity: 0,
      topChromeSurfaceOpacity: 0,
      gateStageFullBleedMinHeight: true,
    };
  }
  return { ...HOME_NAVBAR_CHROME_LAYOUT_DEFAULT };
}

/**
 * Зона «полного бэкинга» под навбаром/доком: сравнение с квантованием скролла,
 * чтобы на границе hero не дребезжало `true`/`false` из‑за субпикселя Lenis
 * (лишние перерисовки и ощущение «залипания» колеса).
 */
export function computeGateStageFullBleedMinHeight(
  scroll: number,
  heroMinScrollY: number | null
): boolean {
  if (heroMinScrollY == null) return true;
  const q = HOME_NAVBAR_CHROME_SCROLL_QUANTIZE_PX;
  const scrollQ = q > 0 ? Math.round(scroll / q) * q : scroll;
  const heroQ = q > 0 ? Math.round(heroMinScrollY / q) * q : heroMinScrollY;
  return scrollQ < heroQ;
}

/** Видимость оболочки навбара/дока: тот же квантованный порог, что и «дошли до якоря hero». */
export function computeHomeNavbarTopChromeOpacity(
  scroll: number,
  heroMinScrollY: number | null
): number {
  if (heroMinScrollY == null) return 1;
  const q = HOME_NAVBAR_CHROME_SCROLL_QUANTIZE_PX;
  const scrollQ = q > 0 ? Math.round(scroll / q) * q : scroll;
  const heroQ = q > 0 ? Math.round(heroMinScrollY / q) * q : heroMinScrollY;
  return scrollQ >= heroQ ? 1 : 0;
}

export function computeHomeNavbarChromeSurfaceOpacity(
  scroll: number,
  heroMinScrollY: number | null,
  reducedMotion: boolean
): number {
  if (heroMinScrollY == null) return 1;
  const fade = HOME_NAVBAR_CHROME_SURFACE_FADE_SCROLL_PX;
  const q = HOME_NAVBAR_CHROME_SCROLL_QUANTIZE_PX;
  const scrollQ = q > 0 ? Math.round(scroll / q) * q : scroll;
  const fadeStart = heroMinScrollY - fade;
  if (reducedMotion) {
    return scrollQ >= heroMinScrollY ? 1 : 0;
  }
  if (scrollQ >= heroMinScrollY) return 1;
  if (scrollQ <= fadeStart) return 0;
  const blended = clamp01((scrollQ - fadeStart) / fade);
  const step = HOME_NAVBAR_CHROME_SURFACE_OPACITY_STEP;
  const stepped = step > 0 ? Math.round(blended / step) * step : blended;
  return clamp01(stepped);
}

export function computeHomeNavbarChromeSnap(p: ComputeHomeNavbarChromeParams): HomeNavbarChromeSnap {
  if (!p.enabled) {
    return { ...HOME_NAVBAR_CHROME_LAYOUT_DEFAULT };
  }

  const topChromeSurfaceOpacity = computeHomeNavbarChromeSurfaceOpacity(
    p.scroll,
    p.heroMinScrollY,
    p.reducedMotion
  );

  const gateStageFullBleedMinHeight = computeGateStageFullBleedMinHeight(
    p.scroll,
    p.heroMinScrollY
  );

  const topChromeOpacity = computeHomeNavbarTopChromeOpacity(p.scroll, p.heroMinScrollY);

  return {
    topChromeOpacity,
    topChromeSurfaceOpacity,
    mainUsesNavbarTopPadding: true,
    gateStageFullBleedMinHeight,
    disableTopChromeTransition: p.reducedMotion,
  };
}
