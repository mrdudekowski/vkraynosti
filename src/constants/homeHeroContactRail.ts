import { HOME_NAVBAR_CHROME_TRANSITION_MS } from './homeNavbarChrome';
import { UI } from './ui';

/** Длительность enter/exit rail — синхрон с navbar chrome (`duration-home-hero-contact-rail`). */
export const HOME_HERO_CONTACT_RAIL_TRANSITION_MS = HOME_NAVBAR_CHROME_TRANSITION_MS;

/** Вертикальный зазор под navbar (`spacing.home-hero-contact-rail-top-gap`). */
export const HOME_HERO_CONTACT_RAIL_TOP_GAP_REM = 0.375;

/** Смещение линии скрытия: верх `#tours` под navbar + offset (px). */
export const HOME_HERO_CONTACT_RAIL_TOURS_HIDE_OFFSET_PX = 8;

/** Плавный переход hide 0→1 по скроллу (px) до порога. */
export const HOME_HERO_CONTACT_RAIL_TOURS_HIDE_FADE_PX = 48;

/** Квантование rect.top для Lenis (как team zone / navbar chrome). */
export const HOME_HERO_CONTACT_RAIL_SCROLL_QUANTIZE_PX = 4;

/** Амплитуда keyframes `home-hero-contact-float` (px). */
export const HOME_HERO_CONTACT_RAIL_FLOAT_AMPLITUDE_PX = 3;

/** Период левитации (`animate-home-hero-contact-float`). */
export const HOME_HERO_CONTACT_RAIL_FLOAT_DURATION_MS = 3600;

export function quantizeHomeHeroContactRailPx(value: number): number {
  const q = HOME_HERO_CONTACT_RAIL_SCROLL_QUANTIZE_PX;
  return q > 0 ? Math.round(value / q) * q : value;
}

function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/**
 * 0 — rail в зоне hero; 1 — верх `#tours` дошёл до линии под navbar (спрятать под chrome).
 */
export function computeHomeHeroContactRailHideProgress(
  toursSectionTopPx: number,
  navbarChromePx: number,
  hideOffsetPx: number = HOME_HERO_CONTACT_RAIL_TOURS_HIDE_OFFSET_PX,
  fadeBandPx: number = HOME_HERO_CONTACT_RAIL_TOURS_HIDE_FADE_PX
): number {
  const threshold = navbarChromePx + hideOffsetPx;
  if (toursSectionTopPx <= threshold) return 1;
  if (fadeBandPx <= 0 || toursSectionTopPx >= threshold + fadeBandPx) return 0;
  return clamp01(1 - (toursSectionTopPx - threshold) / fadeBandPx);
}

/**
 * Итоговая видимость rail на главной:
 * `topChromeOpacity * topChromeSurfaceOpacity * (1 - hideProgress) * (1 - bridgeHideProgress)`.
 * Синхрон с появлением navbar в hero; на mobile chrome обычно ≈1, скрытие — по `#tours` и bridge.
 */
export function computeHomeHeroContactRailRevealProgress(
  topChromeOpacity: number,
  topChromeSurfaceOpacity: number,
  hideProgress: number,
  bridgeHideProgress = 0
): number {
  const chrome = clamp01(topChromeOpacity) * clamp01(topChromeSurfaceOpacity);
  return clamp01(
    chrome * (1 - clamp01(hideProgress)) * (1 - clamp01(bridgeHideProgress))
  );
}

export function getHomeToursSectionElement(): HTMLElement | null {
  return document.getElementById(UI.sections.homeToursSectionElementId);
}
