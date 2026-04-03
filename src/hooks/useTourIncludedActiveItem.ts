import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  TOUR_INCLUDED_AUTO_ROTATE_MS,
  TOUR_INCLUDED_POINTER_EXIT_DELAY_MS,
} from '../constants/tourIncludedHover';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * `true`, если устройство с fine pointer и hover (мышь); иначе тач/SSR — опираемся на tap/focus.
 * SSR: `false` — до гидрации без hover-логики.
 */
function subscribeFinePointerHover(onStoreChange: () => void) {
  const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

function getFinePointerHoverSnapshot() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function getServerSnapshotFinePointerHover() {
  return false;
}

export function useFinePointerHover(): boolean {
  return useSyncExternalStore(
    subscribeFinePointerHover,
    getFinePointerHoverSnapshot,
    getServerSnapshotFinePointerHover
  );
}

/**
 * Один активный индекс в списке «Что включено»: hover с отложенным сбросом, tap без hover,
 * или автокарусель на fine pointer при `itemCount > 1` и без `prefers-reduced-motion`.
 */
export function useTourIncludedActiveItem(
  itemCount: number,
  isInteractionPaused: boolean
) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const finePointerHover = useFinePointerHover();

  const autoRotateEnabled = useMemo(
    () => itemCount > 1 && !reducedMotion && finePointerHover,
    [itemCount, reducedMotion, finePointerHover]
  );

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current != null) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const scheduleExit = useCallback(() => {
    if (autoRotateEnabled) return;
    clearExitTimer();
    if (reducedMotion) {
      setActiveIndex(null);
      return;
    }
    exitTimerRef.current = setTimeout(() => {
      setActiveIndex(null);
      exitTimerRef.current = null;
    }, TOUR_INCLUDED_POINTER_EXIT_DELAY_MS);
  }, [autoRotateEnabled, clearExitTimer, reducedMotion]);

  const activate = useCallback(
    (index: number) => {
      clearExitTimer();
      setActiveIndex((prev) => (prev === index ? prev : index));
    },
    [clearExitTimer]
  );

  const toggleOrActivate = useCallback(
    (index: number) => {
      clearExitTimer();
      setActiveIndex((prev) => (prev === index ? null : index));
    },
    [clearExitTimer]
  );

  useEffect(() => () => clearExitTimer(), [clearExitTimer]);

  useEffect(() => {
    setActiveIndex((prev) => {
      if (itemCount === 0) return null;
      if (prev === null) return prev;
      if (prev >= itemCount) return prev % itemCount;
      return prev;
    });
  }, [itemCount]);

  useEffect(() => {
    if (!autoRotateEnabled || itemCount < 2) return;
    setActiveIndex((prev) => (prev === null ? 0 : prev));
  }, [autoRotateEnabled, itemCount]);

  useEffect(() => {
    if (!autoRotateEnabled || itemCount < 2 || isInteractionPaused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const base = prev === null ? 0 : prev;
        return (base + 1) % itemCount;
      });
    }, TOUR_INCLUDED_AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [autoRotateEnabled, itemCount, isInteractionPaused]);

  return {
    activeIndex,
    activate,
    scheduleExit,
    clearExitTimer,
    toggleOrActivate,
  };
}
