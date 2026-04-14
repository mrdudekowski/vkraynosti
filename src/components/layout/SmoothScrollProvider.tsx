import { useEffect, useMemo, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { getLenisRootOptions, SMOOTH_SCROLL_ENABLED } from '../../constants/smoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

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
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
