import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface UseTourProgramViewportTrackOptions {
  enabled: boolean;
  viewportRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLElement | null>;
  activeItemRef: RefObject<HTMLElement | null>;
  updateKey: string | number;
}

export interface UseTourProgramViewportTrackResult {
  trackOffsetY: number;
}

/**
 * Keeps the latest revealed program item inside the visible sticky-card viewport.
 */
export function useTourProgramViewportTrack({
  enabled,
  viewportRef,
  trackRef,
  activeItemRef,
  updateKey,
}: UseTourProgramViewportTrackOptions): UseTourProgramViewportTrackResult {
  const [trackOffsetY, setTrackOffsetY] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  const computeTrackOffset = useCallback(() => {
    const viewportEl = viewportRef.current;
    const trackEl = trackRef.current;
    const activeItemEl = activeItemRef.current;

    if (!enabled || !viewportEl || !trackEl || !activeItemEl) {
      setTrackOffsetY((prev) => (prev === 0 ? prev : 0));
      return;
    }

    const viewportHeight = viewportEl.clientHeight;
    const trackHeight = trackEl.scrollHeight;

    if (viewportHeight <= 0 || trackHeight <= viewportHeight) {
      setTrackOffsetY((prev) => (prev === 0 ? prev : 0));
      return;
    }

    const activeItemTop = activeItemEl.offsetTop;
    const activeItemHeight = activeItemEl.offsetHeight;
    const activeItemBottom = activeItemTop + activeItemHeight;
    const maxNegativeOffset = viewportHeight - trackHeight;
    const nextOffset =
      activeItemHeight >= viewportHeight
        ? -activeItemTop
        : viewportHeight - activeItemBottom;
    const clampedOffset = clamp(nextOffset, maxNegativeOffset, 0);

    setTrackOffsetY((prev) =>
      prev === clampedOffset ? prev : clampedOffset
    );
  }, [activeItemRef, enabled, trackRef, viewportRef]);

  const scheduleCompute = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      computeTrackOffset();
    });
  }, [computeTrackOffset]);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const viewportEl = viewportRef.current;
    const trackEl = trackRef.current;
    if (!viewportEl || !trackEl) {
      return;
    }

    const resizeObserver = new ResizeObserver(scheduleCompute);
    resizeObserver.observe(viewportEl);
    resizeObserver.observe(trackEl);
    window.addEventListener('resize', scheduleCompute);

    scheduleCompute();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleCompute);
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    computeTrackOffset,
    enabled,
    scheduleCompute,
    trackRef,
    updateKey,
    viewportRef,
  ]);

  return { trackOffsetY: enabled ? trackOffsetY : 0 };
}
