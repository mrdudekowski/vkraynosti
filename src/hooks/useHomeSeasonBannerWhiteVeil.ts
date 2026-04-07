import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useLenis } from 'lenis/react';
import {
  HOME_SEASON_BANNER_VEIL_ENTER_RAMP_PX,
  HOME_SEASON_BANNER_VEIL_EXIT_RAMP_PX,
} from '../constants/homeSeasonBannerWhiteVeil';

const OPACITY_UPDATE_EPSILON = 0.002;

function smoothstep01(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function computeHomeSeasonVeilOpacity(
  sectionEl: HTMLElement | null,
  teamEl: HTMLElement | null
): number {
  if (!sectionEl || !teamEl) return 0;
  const vh = window.innerHeight;
  const sectionTop = sectionEl.getBoundingClientRect().top;
  const teamTop = teamEl.getBoundingClientRect().top;

  if (teamTop <= 0) return 0;

  const enterLinear = Math.max(
    0,
    Math.min(1, (vh - sectionTop) / HOME_SEASON_BANNER_VEIL_ENTER_RAMP_PX)
  );
  const enter = smoothstep01(enterLinear);

  const exitLinear = Math.max(
    0,
    Math.min(1, teamTop / HOME_SEASON_BANNER_VEIL_EXIT_RAMP_PX)
  );
  const exit = smoothstep01(exitLinear);

  return enter * exit;
}

export interface UseHomeSeasonBannerWhiteVeilOptions {
  seasonStripSectionRef: RefObject<HTMLElement | null>;
  teamSectionRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}

export function useHomeSeasonBannerWhiteVeil({
  seasonStripSectionRef,
  teamSectionRef,
  enabled,
}: UseHomeSeasonBannerWhiteVeilOptions): { veilOpacity: number } {
  const lenis = useLenis();
  const [veilOpacity, setVeilOpacity] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  const runCompute = useCallback(() => {
    if (!enabled) {
      setVeilOpacity((prev) => (prev === 0 ? prev : 0));
      return;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVeilOpacity((prev) => (prev === 0 ? prev : 0));
      return;
    }
    const next = computeHomeSeasonVeilOpacity(
      seasonStripSectionRef.current,
      teamSectionRef.current
    );
    setVeilOpacity((prev) =>
      Math.abs(prev - next) < OPACITY_UPDATE_EPSILON ? prev : next
    );
  }, [enabled, seasonStripSectionRef, teamSectionRef]);

  const scheduleCompute = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      runCompute();
    });
  }, [runCompute]);

  useLayoutEffect(() => {
    if (!enabled) {
      setVeilOpacity(0);
      return;
    }

    const sectionEl = seasonStripSectionRef.current;
    const teamEl = teamSectionRef.current;

    const unsubscribeLenis = lenis?.on('scroll', scheduleCompute);
    const onWindowScroll = () => scheduleCompute();
    if (!lenis) {
      window.addEventListener('scroll', onWindowScroll, { passive: true });
    }
    window.addEventListener('resize', scheduleCompute);

    const resizeObserver = new ResizeObserver(scheduleCompute);
    if (sectionEl) resizeObserver.observe(sectionEl);
    if (teamEl) resizeObserver.observe(teamEl);

    runCompute();

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
  }, [
    enabled,
    lenis,
    runCompute,
    scheduleCompute,
    seasonStripSectionRef,
    teamSectionRef,
  ]);

  return { veilOpacity };
}
