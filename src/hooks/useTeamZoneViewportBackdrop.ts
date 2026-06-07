import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefCallback,
} from 'react';
import { useLenis } from 'lenis/react';
import {
  computeHomeTeamSectionCenterPx,
  resolveHomeNavbarBridgeHideProgress,
} from '../constants/homeNavbarBridgeChrome';
import { useHomeNavbarChrome } from '../context/useHomeNavbarChrome';
import {
  computeTeamZoneBackdropProgress,
  computeTeamZoneFadeInProgress,
  computeTeamZoneBridgeFadeOutProgress,
  computeTeamZoneFadeOutProgress,
  getHomeContactSectionElement,
  getHomeTeamContactBridgeElement,
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
  const { snap: homeNavbarChromeSnap, publishHomeNavbarChrome } = useHomeNavbarChrome();
  const homeNavbarChromeSnapRef = useRef(homeNavbarChromeSnap);
  const lastPublishedBridgeHideRef = useRef<number | null>(null);
  const backdropRef = useRef<HTMLElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    homeNavbarChromeSnapRef.current = homeNavbarChromeSnap;
  }, [homeNavbarChromeSnap]);

  const publishBridgeHideProgress = useCallback(
    (bridgeHideProgress: number) => {
      const prev = homeNavbarChromeSnapRef.current;
      if (prev.bridgeHideProgress === bridgeHideProgress) return;
      if (lastPublishedBridgeHideRef.current === bridgeHideProgress) return;
      lastPublishedBridgeHideRef.current = bridgeHideProgress;
      publishHomeNavbarChrome({ ...prev, bridgeHideProgress });
    },
    [publishHomeNavbarChrome]
  );

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
      publishBridgeHideProgress(0);
      return;
    }

    const vh = window.innerHeight;
    const teamEl = getHomeTeamSectionElement();
    const bridgeEl = getHomeTeamContactBridgeElement();
    const contactEl = getHomeContactSectionElement();
    const teamCenter =
      teamEl != null && homeNavbarChromeSnapRef.current.topChromeOpacity > 0
        ? quantizeTeamZoneScrollPx(
            computeHomeTeamSectionCenterPx(teamEl.getBoundingClientRect())
          )
        : null;
    const bridgeHideProgress = resolveHomeNavbarBridgeHideProgress({
      teamCenterPx: teamCenter,
      viewportHeightPx: vh,
      topChromeOpacity: homeNavbarChromeSnapRef.current.topChromeOpacity,
      reducedMotion,
    });
    publishBridgeHideProgress(bridgeHideProgress);

    const progress = computeTeamZoneBackdropProgress(teamEl, contactEl, vh, bridgeEl);

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
      const bridgeTop = bridgeEl
        ? quantizeTeamZoneScrollPx(bridgeEl.getBoundingClientRect().top)
        : null;
      const contactTop = contactEl
        ? quantizeTeamZoneScrollPx(contactEl.getBoundingClientRect().top)
        : null;
      const fadeIn = computeTeamZoneFadeInProgress(teamTop, vh);
      const fadeOutBridge =
        bridgeEl != null && bridgeTop != null
          ? computeTeamZoneBridgeFadeOutProgress(bridgeTop, vh)
          : null;
      const fadeOutContact =
        contactEl != null && contactTop != null
          ? computeTeamZoneFadeOutProgress(contactTop, vh)
          : null;
      const fadeOut =
        fadeOutBridge != null && fadeOutContact != null
          ? Math.min(fadeOutBridge, fadeOutContact)
          : fadeOutBridge ?? fadeOutContact;
      const skyEl = document.querySelector('.top-home-sky-parallax-inner');
      emitTeamBackdropDebugLog(
        'useTeamZoneViewportBackdrop.ts:applyStyles',
        'team backdrop sample',
        {
          teamTop,
          bridgeTop,
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
  }, [enabled, reducedMotion, publishBridgeHideProgress]);

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
