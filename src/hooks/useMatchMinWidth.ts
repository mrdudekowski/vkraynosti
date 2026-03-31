import { useMemo, useSyncExternalStore } from 'react';

/**
 * `true`, если `min-width` выполняется (SSR: `false`).
 */
export function useMatchMinWidth(minWidthPx: number): boolean {
  const query = useMemo(() => `(min-width: ${minWidthPx}px)`, [minWidthPx]);

  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
