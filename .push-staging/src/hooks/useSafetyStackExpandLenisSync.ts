import { useEffect, type TransitionEventHandler } from 'react';
import { useLenis } from 'lenis/react';
import { SAFETY_STATUS_STACK_EXPAND_MS } from '../constants/safetyStatusRotation';

type UseSafetyStackExpandLenisSyncOptions = {
  visibleCount: number;
  prefersReducedMotion: boolean;
};

/**
 * Пересчёт Lenis после анимации `max-height` стека #safety на mobile.
 */
export function useSafetyStackExpandLenisSync({
  visibleCount,
  prefersReducedMotion,
}: UseSafetyStackExpandLenisSyncOptions): {
  onStackMaxHeightTransitionEnd: TransitionEventHandler<HTMLDivElement>;
} {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || prefersReducedMotion) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lenis.resize();
    }, SAFETY_STATUS_STACK_EXPAND_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [visibleCount, lenis, prefersReducedMotion]);

  const onStackMaxHeightTransitionEnd: TransitionEventHandler<HTMLDivElement> = (
    event
  ) => {
    if (event.propertyName !== 'max-height' || !lenis) {
      return;
    }
    lenis.resize();
  };

  return { onStackMaxHeightTransitionEnd };
}
