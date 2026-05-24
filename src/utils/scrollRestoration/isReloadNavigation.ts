/** `true` при F5 / Ctrl+R / location.reload() — не при SPA-переходе. */
export function isReloadNavigation(): boolean {
  if (typeof window === 'undefined') return false;

  const entry = performance.getEntriesByType('navigation')[0];
  if (entry != null && 'type' in entry) {
    return (entry as PerformanceNavigationTiming).type === 'reload';
  }

  const legacy = performance.navigation;
  return legacy != null && legacy.type === legacy.TYPE_RELOAD;
}
