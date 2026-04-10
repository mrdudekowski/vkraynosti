import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefCallback } from 'react';
import { useLenis } from 'lenis/react';
import {
  computeParallaxTranslateYPx,
  HOME_SKY_PARALLAX_SCROLL_FACTOR,
} from '../constants/homeParallax';
import { getViewportScrollY } from '../constants/smoothScroll';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Вертикальный параллакс для слоя неба на главной: `translateY` ∝ scrollY (inline, без setState на скролл).
 */
export function useHomeSkyParallax(): { ref: RefCallback<HTMLElement> } {
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();
  const elementRef = useRef<HTMLElement | null>(null);
  const [elementAttached, setElementAttached] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  const setRef: RefCallback<HTMLElement> = useCallback((node) => {
    elementRef.current = node;
    setElementAttached(node != null);
  }, []);

  const applyStyles = useCallback(() => {
    const el = elementRef.current;
    if (!el || typeof window === 'undefined') return;

    if (reducedMotion) {
      el.style.transform = 'none';
      return;
    }

    const scrollY = getViewportScrollY(lenis);
    const yPx = computeParallaxTranslateYPx(scrollY, HOME_SKY_PARALLAX_SCROLL_FACTOR);
    el.style.transform = `translate3d(0, ${yPx}px, 0)`;
  }, [lenis, reducedMotion]);

  const schedule = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      applyStyles();
    });
  }, [applyStyles]);

  useLayoutEffect(() => {
    applyStyles();
  }, [applyStyles]);

  useEffect(() => {
    if (!elementAttached) return;

    let unsubLenis: (() => void) | undefined;
    if (lenis) {
      unsubLenis = lenis.on('scroll', schedule);
    } else {
      window.addEventListener('scroll', schedule, { passive: true });
    }

    schedule();

    return () => {
      unsubLenis?.();
      if (!lenis) {
        window.removeEventListener('scroll', schedule);
      }
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [elementAttached, lenis, schedule]);

  return { ref: setRef };
}
