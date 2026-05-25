import { useCallback, useEffect, useLayoutEffect, useRef, type RefCallback } from 'react';
import { useLenis } from 'lenis/react';
import {
  computeTeamZoneBackdropProgress,
  computeTeamZoneFadeInProgress,
  computeTeamZoneFadeOutProgress,
  getHomeContactSectionElement,
  getHomeTeamSectionElement,
  quantizeTeamZoneScrollPx,
  TEAM_ZONE_REDUCED_MOTION_THRESHOLD,
} from '../constants/teamZoneScroll';
import {
  emitTeamBackdropDebugLog,
  getActiveTeamBackdropExperiments,
  isTeamBackdropDebugBinaryOpacity,
  probeViewportBottomElement,
  shouldEmitTeamBackdropDebugLog,
} from '../utils/teamBackdropDebug';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface UseTeamZoneViewportBackdropOptions {
  enabled: boolean;
}

/**
 * Управляет opacity фиксированной шторы зоны «Команда» (inline style, без setState на каждый кадр).
 */
export function useTeamZoneViewportBackdrop({
  enabled,
}: UseTeamZoneViewportBackdropOptions): { backdropRef: RefCallback<HTMLElement> } {
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();
  const backdropRef = useRef<HTMLElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const setBackdropRef: RefCallback<HTMLElement> = useCallback((node) => {
    backdropRef.current = node;
  }, []);

  const applyStyles = useCallback(() => {
    const el = backdropRef.current;
    if (!el || !enabled || typeof window === 'undefined') {
      if (el) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      }
      return;
    }

    const vh = window.innerHeight;
    const teamEl = getHomeTeamSectionElement();
    const contactEl = getHomeContactSectionElement();
    const progress = computeTeamZoneBackdropProgress(teamEl, contactEl, vh);

    let opacity = reducedMotion
      ? progress >= TEAM_ZONE_REDUCED_MOTION_THRESHOLD
        ? 1
        : 0
      : progress;

    if (isTeamBackdropDebugBinaryOpacity()) {
      opacity = progress >= 1 ? 1 : 0;
    }

    el.style.opacity = String(opacity);
    el.style.pointerEvents = 'none';

    if (shouldEmitTeamBackdropDebugLog(progress) && teamEl) {
      const teamTop = quantizeTeamZoneScrollPx(teamEl.getBoundingClientRect().top);
      const contactTop = contactEl
        ? quantizeTeamZoneScrollPx(contactEl.getBoundingClientRect().top)
        : null;
      const fadeIn = computeTeamZoneFadeInProgress(teamTop, vh);
      const fadeOut =
        contactEl != null && contactTop != null
          ? computeTeamZoneFadeOutProgress(contactTop, vh)
          : null;
      const skyEl = document.querySelector('.top-home-sky-parallax-inner');
      emitTeamBackdropDebugLog(
        'useTeamZoneViewportBackdrop.ts:applyStyles',
        'team backdrop sample',
        {
          teamTop,
          contactTop,
          progress,
          opacity,
          innerHeight: vh,
          visualViewportHeight: window.visualViewport?.height ?? null,
          fadeIn,
          fadeOut,
          experiment: getActiveTeamBackdropExperiments().join(',') || 'baseline',
          bottomHit: probeViewportBottomElement(),
          backdropOpacity: opacity,
          skyTransform: skyEl ? getComputedStyle(skyEl).transform : null,
        },
        progress > 0 && progress < 1 ? 'H9' : 'H5'
      );
    }
  }, [enabled, reducedMotion]);

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
    if (!enabled) return;

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
  }, [enabled, lenis, schedule]);

  return { backdropRef: setBackdropRef };
}
