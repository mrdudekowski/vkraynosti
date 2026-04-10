import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefCallback } from 'react';
import { useLenis } from 'lenis/react';
import {
  computeHomeScrollFadeProgress,
  HOME_SCROLL_FADE_POINTER_EVENTS_MIN_PROGRESS,
  HOME_SCROLL_FADE_TRANSLATE_Y_REM,
} from '../constants/homeScrollFade';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

/**
 * Подстраивает opacity и translateY под скролл (inline style, без setState на каждый кадр).
 * Lenis — через `on('scroll')`, иначе `window` scroll.
 */
export function useScrollScrubFade(): { ref: RefCallback<HTMLElement> } {
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
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.removeProperty('pointer-events');
      return;
    }

    const vh = window.innerHeight;
    const top = el.getBoundingClientRect().top;
    const t = computeHomeScrollFadeProgress(top, vh);
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const dyPx = (1 - t) * HOME_SCROLL_FADE_TRANSLATE_Y_REM * remPx;

    el.style.opacity = String(t);
    el.style.transform = `translate3d(0, ${dyPx}px, 0)`;
    if (t < HOME_SCROLL_FADE_POINTER_EVENTS_MIN_PROGRESS) {
      el.style.pointerEvents = 'none';
    } else {
      el.style.removeProperty('pointer-events');
    }
  }, [reducedMotion]);

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

    const el = elementRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      schedule();
    });
    ro.observe(el);

    const onResize = () => {
      schedule();
    };
    window.addEventListener('resize', onResize, { passive: true });

    let unsubLenis: (() => void) | undefined;
    if (lenis) {
      unsubLenis = lenis.on('scroll', schedule);
    } else {
      window.addEventListener('scroll', schedule, { passive: true });
    }

    schedule();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
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
