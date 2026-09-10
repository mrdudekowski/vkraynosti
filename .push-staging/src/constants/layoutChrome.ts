/**
 * SSOT: высота фиксированного navbar + safe area (iOS notch / Dynamic Island).
 * CSS-переменные задаются в `src/index.css`; Tailwind-токены — в `tailwind.config.ts`.
 */

/** Высота контентной строки navbar (= `spacing.navbar` / `h-16`). */
export const NAVBAR_CONTENT_HEIGHT_PX = 64 as const;

export const SAFE_AREA_TOP_CSS_VAR = '--safe-area-top' as const;
export const NAVBAR_CHROME_HEIGHT_CSS_VAR = '--navbar-chrome-height' as const;

/** Читает полную высоту chrome (navbar + safe-area-top) из CSS-переменной. */
export function readNavbarChromeHeightPx(): number {
  if (typeof document === 'undefined') {
    return NAVBAR_CONTENT_HEIGHT_PX;
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(NAVBAR_CHROME_HEIGHT_CSS_VAR)
    .trim();

  if (!raw) {
    return NAVBAR_CONTENT_HEIGHT_PX;
  }

  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.height = raw;
  document.documentElement.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();

  return height > 0 ? height : NAVBAR_CONTENT_HEIGHT_PX;
}
