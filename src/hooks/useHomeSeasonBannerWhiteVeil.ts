import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useLenis } from 'lenis/react';
import {
  HOME_SEASON_BANNER_VEIL_CONTACT_ENTER_RAMP_PX,
  HOME_SEASON_BANNER_VEIL_CONTACT_LEAD_PX,
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
  exitAnchorEl: HTMLElement | null,
  contactEnterEl: HTMLElement | null
): number {
  if (!sectionEl || !exitAnchorEl) return 0;
  const vh = window.innerHeight;
  const sectionTop = sectionEl.getBoundingClientRect().top;
  const exitTop = exitAnchorEl.getBoundingClientRect().top;

  if (exitTop <= 0) return 0;

  const enterSectionLinear = Math.max(
    0,
    Math.min(1, (vh - sectionTop) / HOME_SEASON_BANNER_VEIL_ENTER_RAMP_PX)
  );
  const enterSection = smoothstep01(enterSectionLinear);

  let enterContact = 0;
  if (contactEnterEl) {
    const contactBottom = contactEnterEl.getBoundingClientRect().bottom;
    const enterContactLinear = Math.max(
      0,
      Math.min(
        1,
        (vh - contactBottom + HOME_SEASON_BANNER_VEIL_CONTACT_LEAD_PX) /
          HOME_SEASON_BANNER_VEIL_CONTACT_ENTER_RAMP_PX
      )
    );
    enterContact = smoothstep01(enterContactLinear);
  }

  const enter = Math.max(enterSection, enterContact);

  const exitLinear = Math.max(
    0,
    Math.min(1, exitTop / HOME_SEASON_BANNER_VEIL_EXIT_RAMP_PX)
  );
  const exit = smoothstep01(exitLinear);

  return enter * exit;
}

export interface UseHomeSeasonBannerWhiteVeilOptions {
  seasonStripSectionRef: RefObject<HTMLElement | null>;
  /**
   * Нижняя зона полосы сезона на главной (подпись «В другой сезон» + переключатель):
   * пока верх якоря ниже верха вьюпорта — множитель выхода; при `top <= 0` вуаль 0.
   */
  veilExitAnchorRef: RefObject<HTMLElement | null>;
  /** Секция `#contact` на главной — ранний вход вуали при прокрутке к блоку с кнопками связи. */
  veilEnterContactRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}

export function useHomeSeasonBannerWhiteVeil({
  seasonStripSectionRef,
  veilExitAnchorRef,
  veilEnterContactRef,
  enabled,
}: UseHomeSeasonBannerWhiteVeilOptions): { veilOpacity: number } {
  const lenis = useLenis();
  const [veilOpacityInternal, setVeilOpacityInternal] = useState(0);
  const rafIdRef = useRef<number | null>(null);
  const veilOpacity = enabled ? veilOpacityInternal : 0;

  const runCompute = useCallback(() => {
    if (!enabled) {
      setVeilOpacityInternal((prev) => (prev === 0 ? prev : 0));
      return;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setVeilOpacityInternal((prev) => (prev === 0 ? prev : 0));
      return;
    }
    const next = computeHomeSeasonVeilOpacity(
      seasonStripSectionRef.current,
      veilExitAnchorRef.current,
      veilEnterContactRef.current
    );
    setVeilOpacityInternal((prev) =>
      Math.abs(prev - next) < OPACITY_UPDATE_EPSILON ? prev : next
    );
  }, [
    enabled,
    seasonStripSectionRef,
    veilExitAnchorRef,
    veilEnterContactRef,
  ]);

  const scheduleCompute = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      runCompute();
    });
  }, [runCompute]);

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const sectionEl = seasonStripSectionRef.current;
    const exitAnchorEl = veilExitAnchorRef.current;
    const contactEl = veilEnterContactRef.current;

    const unsubscribeLenis = lenis?.on('scroll', scheduleCompute);
    const onWindowScroll = () => scheduleCompute();
    if (!lenis) {
      window.addEventListener('scroll', onWindowScroll, { passive: true });
    }
    window.addEventListener('resize', scheduleCompute);

    const resizeObserver = new ResizeObserver(scheduleCompute);
    if (sectionEl) resizeObserver.observe(sectionEl);
    if (exitAnchorEl) resizeObserver.observe(exitAnchorEl);
    if (contactEl) resizeObserver.observe(contactEl);

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
  }, [
    enabled,
    lenis,
    runCompute,
    scheduleCompute,
    seasonStripSectionRef,
    veilExitAnchorRef,
    veilEnterContactRef,
  ]);

  return { veilOpacity };
}
