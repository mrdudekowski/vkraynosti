import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { getLenisRootOptions, SMOOTH_SCROLL_ENABLED } from '../../constants/smoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

const VISUAL_VIEWPORT_RESIZE_DEBOUNCE_MS = 100;

/**
 * Один RAF-цикл: каждый кадр `lenis.raf(time)` — без лишней зависимости на сторонний рантайм анимаций.
 * Фичи могут подписаться на `lenis.on('scroll')` и синхронизировать UI со скроллом.
 */
function LenisRafSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    let frameId = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [lenis]);

  return null;
}

/** Пересчёт Lenis при смене visual viewport (iOS Safari: адресная строка, ориентация). */
function LenisVisualViewportSync() {
  const lenis = useLenis();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lenis) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    const scheduleResize = () => {
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        lenis.resize();
      }, VISUAL_VIEWPORT_RESIZE_DEBOUNCE_MS);
    };

    viewport.addEventListener('resize', scheduleResize);
    return () => {
      viewport.removeEventListener('resize', scheduleResize);
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [lenis]);

  return null;
}

type SmoothScrollProviderProps = {
  children: ReactNode;
};

const SmoothScrollProvider = ({ children }: SmoothScrollProviderProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const options = useMemo(() => getLenisRootOptions(), []);

  if (!SMOOTH_SCROLL_ENABLED || prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={options}>
      <LenisRafSync />
      <LenisVisualViewportSync />
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
