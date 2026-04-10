import { useMemo, type ReactNode } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useAnimationFrame } from 'motion/react';
import 'lenis/dist/lenis.css';
import { getLenisRootOptions, SMOOTH_SCROLL_ENABLED } from '../../constants/smoothScroll';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Единый такт: Motion `useAnimationFrame` вызывает `lenis.raf(time)` — без отдельного RAF-цикла в фичах.
 * Фичи могут подписаться на `lenis.on('scroll')` и синхронизировать UI со скроллом.
 */
function LenisMotionRafSync() {
  const lenis = useLenis();
  useAnimationFrame((time) => {
    lenis?.raf(time);
  });
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
      <LenisMotionRafSync />
      {children}
    </ReactLenis>
  );
};

export default SmoothScrollProvider;
