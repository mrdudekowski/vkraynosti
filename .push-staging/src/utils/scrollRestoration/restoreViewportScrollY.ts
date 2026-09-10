import type { default as Lenis } from 'lenis';
import { SCROLL_RESTORATION_MAX_RETRY_MS } from '../../constants/scrollRestoration';

function maxDocumentScrollY(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function canReachScrollY(targetY: number): boolean {
  return maxDocumentScrollY() >= targetY - 1;
}

function applyScrollY(lenis: Lenis | null | undefined, y: number): void {
  const clampedY = Math.min(y, maxDocumentScrollY());
  if (lenis) {
    lenis.scrollTo(clampedY, { immediate: true });
  } else {
    window.scrollTo(0, clampedY);
  }
}

/**
 * Восстанавливает Y после reload: ждёт layout (lazy Home), retry через rAF до maxRetryMs.
 */
export function restoreViewportScrollY(
  lenis: Lenis | null | undefined,
  targetY: number
): void {
  if (typeof window === 'undefined') return;

  const startedAt = performance.now();

  const attempt = (): void => {
    const elapsed = performance.now() - startedAt;
    if (canReachScrollY(targetY) || elapsed >= SCROLL_RESTORATION_MAX_RETRY_MS) {
      applyScrollY(lenis, targetY);
      return;
    }
    requestAnimationFrame(attempt);
  };

  requestAnimationFrame(attempt);
}
