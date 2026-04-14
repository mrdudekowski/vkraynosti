import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useLenis } from 'lenis/react';
import { TOUR_PROGRAM_REVEAL_MIN_RANGE_PX } from '../constants/tourProgramReveal';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeRevealedCount(
  mainColumnEl: HTMLElement,
  stepCount: number,
  scrollY: number
): number {
  if (stepCount <= 0) return 0;
  const rect = mainColumnEl.getBoundingClientRect();
  const startTop = rect.top + scrollY;
  const endBottom = rect.bottom + scrollY;
  const range = endBottom - startTop;
  if (range < TOUR_PROGRAM_REVEAL_MIN_RANGE_PX) {
    return stepCount;
  }
  const viewportHeight = window.innerHeight;
  const progress = (scrollY + viewportHeight - startTop) / range;
  const clamped = clamp(progress, 0, 1);
  return Math.min(stepCount, Math.ceil(clamped * stepCount));
}

export interface UseTourProgramScrollRevealOptions {
  stepCount: number;
  /** lg+ и не prefers-reduced-motion */
  enabled: boolean;
  mainColumnRef: RefObject<HTMLElement | null>;
}

/**
 * Прогресс скролла по высоте основной колонки → сколько этапов программы «раскрыто».
 * При обратном скролле число уменьшается (синхронно с позицией).
 */
export function useTourProgramScrollReveal({
  stepCount,
  enabled,
  mainColumnRef,
}: UseTourProgramScrollRevealOptions): { revealedCount: number } {
  const lenis = useLenis();
  const [scrollRevealedCount, setScrollRevealedCount] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  const revealedCount = useMemo(() => {
    if (!enabled) return stepCount;
    if (stepCount === 0) return 0;
    return scrollRevealedCount;
  }, [enabled, stepCount, scrollRevealedCount]);

  const runCompute = useCallback(() => {
    const el = mainColumnRef.current;
    if (!el) return;
    const scrollY = lenis?.scroll ?? window.scrollY;
    const nextCount = computeRevealedCount(el, stepCount, scrollY);
    setScrollRevealedCount((prev) =>
      prev === nextCount ? prev : nextCount
    );
  }, [lenis, mainColumnRef, stepCount]);

  const scheduleCompute = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      runCompute();
    });
  }, [runCompute]);

  useLayoutEffect(() => {
    if (!enabled || stepCount === 0) {
      return;
    }

    const el = mainColumnRef.current;
    if (!el) return;

    const unsubscribeLenis = lenis?.on('scroll', scheduleCompute);
    const onWindowScroll = () => scheduleCompute();
    if (!lenis) {
      window.addEventListener('scroll', onWindowScroll, { passive: true });
    }
    window.addEventListener('resize', scheduleCompute);

    const resizeObserver = new ResizeObserver(scheduleCompute);
    resizeObserver.observe(el);

    runCompute();
    scheduleCompute();

    return () => {
      unsubscribeLenis?.();
      if (!lenis) {
        window.removeEventListener('scroll', onWindowScroll);
      }
      window.removeEventListener('resize', scheduleCompute);
      resizeObserver.disconnect();
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [enabled, stepCount, lenis, mainColumnRef, runCompute, scheduleCompute]);

  return { revealedCount };
}
