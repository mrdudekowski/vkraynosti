/**
 * SSOT: desktop tour cover webp → mobile variant file name.
 * Generate with `npm run media:covers-mobile`; verify with `npm run media:verify-covers`.
 */
export function tourCoverMobileVariantUrl(desktopWebpUrl: string): string {
  return desktopWebpUrl.replace(/\.webp$/i, '.mobile.webp');
}

/** Non-suffix mobile paths (preface, legacy names) — see TOUR_COVER_MOBILE_OVERRIDES in images.ts */
export function resolveTourCoverMobileUrl(
  desktopUrl: string,
  overrides?: Readonly<Record<string, string>>
): string {
  return overrides?.[desktopUrl] ?? tourCoverMobileVariantUrl(desktopUrl);
}
