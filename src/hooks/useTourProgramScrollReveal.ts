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

function computeRevealedItemCount(
  mainColumnEl: HTMLElement,
  itemCount: number,
  scrollY: number
): number {
  if (itemCount <= 0) return 0;
  const rect = mainColumnEl.getBoundingClientRect();
  const startTop = rect.top + scrollY;
  const endBottom = rect.bottom + scrollY;
  const range = endBottom - startTop;
  if (range < TOUR_PROGRAM_REVEAL_MIN_RANGE_PX) {
    return itemCount;
  }
  const viewportHeight = window.innerHeight;
  const progress = (scrollY + viewportHeight - startTop) / range;
  const clamped = clamp(progress, 0, 1);
  return Math.min(itemCount, Math.ceil(clamped * itemCount));
}

export interface UseTourProgramScrollRevealOptions {
  stepCount: number;
  /** lg+ и не prefers-reduced-motion */
  enabled: boolean;
  mainColumnRef: RefObject<HTMLElement | null>;
}

export interface UseTourProgramScrollRevealResult {
  revealedCount: number;
  showProgramFooter: boolean;
}

/**
 * Прогресс скролла по высоте основной колонки → сколько этапов программы «раскрыто».
 * При обратном скролле число уменьшается (синхронно с позицией).
 */
export function useTourProgramScrollReveal({
  stepCount,
  enabled,
  mainColumnRef,
}: UseTourProgramScrollRevealOptions): UseTourProgramScrollRevealResult {
  const lenis = useLenis();
  const [scrollRevealedItemCount, setScrollRevealedItemCount] = useState(0);
  const rafIdRef = useRef<number | null>(null);
  const revealItemCount = stepCount > 0 ? stepCount + 1 : 0;

  const { revealedCount, showProgramFooter } = useMemo(() => {
    if (!enabled) {
      return {
        revealedCount: stepCount,
        showProgramFooter: true,
      };
    }
    if (stepCount === 0) {
      return {
        revealedCount: 0,
        showProgramFooter: false,
      };
    }

    return {
      revealedCount: Math.min(stepCount, scrollRevealedItemCount),
      showProgramFooter: scrollRevealedItemCount > stepCount,
    };
  }, [enabled, stepCount, scrollRevealedItemCount]);

  const runCompute = useCallback(() => {
    const el = mainColumnRef.current;
    if (!el) return;
    const scrollY = lenis?.scroll ?? window.scrollY;
    const nextCount = computeRevealedItemCount(el, revealItemCount, scrollY);
    setScrollRevealedItemCount((prev) =>
      prev === nextCount ? prev : nextCount
    );
  }, [lenis, mainColumnRef, revealItemCount]);

  const scheduleCompute = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      runCompute();
    });
  }, [runCompute]);

  useLayoutEffect(() => {
    if (!enabled || revealItemCount === 0) {
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
  }, [enabled, revealItemCount, lenis, mainColumnRef, runCompute, scheduleCompute]);

  return { revealedCount, showProgramFooter };
}
