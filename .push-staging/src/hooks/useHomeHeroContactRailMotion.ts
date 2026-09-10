import { useCallback, useEffect, useLayoutEffect, useRef, type RefCallback } from 'react';
import { useLenis } from 'lenis/react';
import {
  computeHomeHeroContactRailHideProgress,
  computeHomeHeroContactRailRevealProgress,
  getHomeToursSectionElement,
  quantizeHomeHeroContactRailPx,
} from '../constants/homeHeroContactRail';
import { BREAKPOINT_MD_PX } from '../constants/smoothScroll';
import { readNavbarChromeHeightPx } from '../constants/layoutChrome';
import { useHomeNavbarChrome } from '../context/useHomeNavbarChrome';
import { useMobileNavMenu } from '../context/useMobileNavMenu';
import { useSeasonNavMenu } from '../context/useSeasonNavMenu';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const FLOAT_ACTIVE_CLASS = 'motion-safe:animate-home-hero-contact-float';

export interface UseHomeHeroContactRailMotionOptions {
  enabled: boolean;
}

export interface UseHomeHeroContactRailMotionResult {
  setRailOuterRef: RefCallback<HTMLDivElement>;
}

/**
 * Scroll-linked reveal для `HomeHeroContactRail`: inline transform/opacity (без setState на кадр).
 * `reveal = topChromeOpacity * topChromeSurfaceOpacity * (1 - hideProgress) * (1 - bridgeHideProgress)`.
 */
export function useHomeHeroContactRailMotion({
  enabled,
}: UseHomeHeroContactRailMotionOptions): UseHomeHeroContactRailMotionResult {
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();
  const { snap } = useHomeNavbarChrome();
  const { isBurgerMenuActive } = useMobileNavMenu();
  const { open: seasonNavMenuOpen } = useSeasonNavMenu();
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const snapRef = useRef(snap);

  useLayoutEffect(() => {
    snapRef.current = snap;
  }, [snap]);

  const applyStyles = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer) return;

    if (!enabled || typeof window === 'undefined') {
      outer.style.opacity = '0';
      outer.style.transform = 'translate3d(0, -100%, 0)';
      outer.style.pointerEvents = 'none';
      outer.setAttribute('aria-hidden', 'true');
      if (inner) inner.classList.remove(FLOAT_ACTIVE_CLASS);
      return;
    }

    const toursEl = getHomeToursSectionElement();
    const toursTop = toursEl
      ? quantizeHomeHeroContactRailPx(toursEl.getBoundingClientRect().top)
      : Number.POSITIVE_INFINITY;
    const navbarChromePx = readNavbarChromeHeightPx();
    const hideProgress = computeHomeHeroContactRailHideProgress(toursTop, navbarChromePx);
    const { topChromeOpacity, topChromeSurfaceOpacity, bridgeHideProgress } = snapRef.current;
    const scrollBasedReveal = computeHomeHeroContactRailRevealProgress(
      topChromeOpacity,
      topChromeSurfaceOpacity,
      hideProgress,
      bridgeHideProgress
    );
    const seasonPanelCoversRail =
      typeof window !== 'undefined' &&
      window.innerWidth < BREAKPOINT_MD_PX &&
      seasonNavMenuOpen;
    const navOverlayCoversRail = isBurgerMenuActive || seasonPanelCoversRail;
    let reveal = navOverlayCoversRail ? 0 : scrollBasedReveal;

    if (reducedMotion) {
      reveal = reveal >= 0.5 ? 1 : 0;
    }

    const hidden = reveal < 0.01;
    outer.style.opacity = String(reveal);
    outer.style.transform = `translate3d(0, ${(1 - reveal) * -100}%, 0)`;
    outer.style.pointerEvents = hidden ? 'none' : 'auto';
    outer.setAttribute('aria-hidden', hidden ? 'true' : 'false');

    if (inner) {
      const floatIdle =
        !reducedMotion &&
        reveal >= 0.999 &&
        hideProgress < 0.01 &&
        bridgeHideProgress < 0.01 &&
        topChromeOpacity > 0.99;
      inner.classList.toggle(FLOAT_ACTIVE_CLASS, floatIdle);
    }
  }, [enabled, reducedMotion, isBurgerMenuActive, seasonNavMenuOpen]);

  const schedule = useCallback(() => {
    if (rafIdRef.current != null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      applyStyles();
    });
  }, [applyStyles]);

  const setRailOuterRef: RefCallback<HTMLDivElement> = useCallback((node) => {
    outerRef.current = node;
    if (node) {
      const inner = node.firstElementChild;
      innerRef.current = inner instanceof HTMLDivElement ? inner : null;
    } else {
      innerRef.current = null;
    }
    applyStyles();
  }, [applyStyles]);

  useLayoutEffect(() => {
    applyStyles();
  }, [applyStyles, snap]);

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

  return { setRailOuterRef };
}
