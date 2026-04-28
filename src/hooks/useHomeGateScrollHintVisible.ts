import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

import {
  computeHomeGateScrollHintVisible,
  HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX,
} from '../constants/homeGateScroll';
import { getViewportScrollY } from '../constants/smoothScroll';

/**
 * Видимость стрелки «к hero» на воротах: `true`, пока скролл у верха страницы
 * (`getViewportScrollY` ≤ `HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX`).
 */
export function useHomeGateScrollHintVisible(enabled: boolean): { visible: boolean } {
  const lenis = useLenis();
  /** Только от скролла; итог — `enabled && scrollBasedVisible` (без setState при `enabled === false`). */
  const [scrollBasedVisible, setScrollBasedVisible] = useState(true);

  const readVisible = useCallback((): boolean => {
    if (!enabled) return false;
    const y = getViewportScrollY(lenis);
    return computeHomeGateScrollHintVisible(y, HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX);
  }, [enabled, lenis]);

  const rafRef = useRef<number | null>(null);

  const scheduleSync = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const next = readVisible();
      setScrollBasedVisible((prev) => (prev === next ? prev : next));
    });
  }, [enabled, lenis, readVisible]);

  useLayoutEffect(() => {
    queueMicrotask(() => {
      setScrollBasedVisible(readVisible());
    });
  }, [readVisible]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const cancelRaf = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    scheduleSync();

    if (lenis) {
      const unsub = lenis.on('scroll', scheduleSync);
      return () => {
        unsub();
        cancelRaf();
      };
    }

    const onScroll = () => {
      scheduleSync();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelRaf();
    };
  }, [enabled, lenis, scheduleSync]);

  return { visible: enabled && scrollBasedVisible };
}
