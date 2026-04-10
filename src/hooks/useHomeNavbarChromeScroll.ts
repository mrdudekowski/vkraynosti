import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import { useLenis } from 'lenis/react';
import {
  computeHomeNavbarChromeSnap,
  HOME_NAVBAR_CHROME_LAYOUT_DEFAULT,
  quantizeAxisPxForHomeNavbarChrome,
  type HomeNavbarChromeSnap,
} from '../constants/homeNavbarChrome';
import {
  computeHomeHeroMinScrollY,
  getViewportScrollY,
} from '../constants/smoothScroll';
import { useHomeNavbarChrome } from '../context/useHomeNavbarChrome';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface UseHomeNavbarChromeScrollOptions {
  heroSectionRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}

function chromeSnapKey(s: HomeNavbarChromeSnap): string {
  return `${s.topChromeOpacity}|${s.topChromeSurfaceOpacity}|${s.mainUsesNavbarTopPadding}|${s.gateStageFullBleedMinHeight}|${s.disableTopChromeTransition}`;
}

/**
 * Главная: синхронизирует `HomeNavbarChromeContext` со скроллом (Lenis или `window`),
 * без дублирующего локального `useState` и без лишнего моста в `Home.tsx`.
 */
export function useHomeNavbarChromeScroll({
  heroSectionRef,
  enabled,
}: UseHomeNavbarChromeScrollOptions): void {
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();
  const { publishHomeNavbarChrome } = useHomeNavbarChrome();

  const chromePublishRef = useRef<{
    lastKey: string;
    rafId: number | null;
  }>({
    lastKey: '',
    rafId: null,
  });

  const publishChrome = useCallback(() => {
    if (!enabled) {
      const def: HomeNavbarChromeSnap = { ...HOME_NAVBAR_CHROME_LAYOUT_DEFAULT };
      const key = chromeSnapKey(def);
      if (key !== chromePublishRef.current.lastKey) {
        chromePublishRef.current.lastKey = key;
        startTransition(() => {
          publishHomeNavbarChrome(def);
        });
      }
      return;
    }

    const scrollRaw = getViewportScrollY(lenis);
    const scrollForChrome = quantizeAxisPxForHomeNavbarChrome(scrollRaw);
    const heroMinRaw = computeHomeHeroMinScrollY(scrollRaw, heroSectionRef.current);
    const heroMinForChrome =
      heroMinRaw == null ? null : quantizeAxisPxForHomeNavbarChrome(heroMinRaw);
    const nextChrome = computeHomeNavbarChromeSnap({
      enabled: true,
      scroll: scrollForChrome,
      heroMinScrollY: heroMinForChrome,
      reducedMotion,
    });
    const key = chromeSnapKey(nextChrome);
    if (key !== chromePublishRef.current.lastKey) {
      chromePublishRef.current.lastKey = key;
      startTransition(() => {
        publishHomeNavbarChrome(nextChrome);
      });
    }
  }, [
    enabled,
    heroSectionRef,
    lenis,
    publishHomeNavbarChrome,
    reducedMotion,
  ]);

  const publishChromeRef = useRef(publishChrome);

  useLayoutEffect(() => {
    publishChromeRef.current = publishChrome;
  }, [publishChrome]);

  const schedulePublishChrome = useCallback(() => {
    if (chromePublishRef.current.rafId != null) return;
    chromePublishRef.current.rafId = requestAnimationFrame(() => {
      chromePublishRef.current.rafId = null;
      publishChromeRef.current();
    });
  }, []);

  useLayoutEffect(() => {
    queueMicrotask(() => {
      publishChrome();
    });
  }, [publishChrome]);

  useEffect(() => {
    if (!enabled) return;
    publishChrome();
    const chromeState = chromePublishRef.current;
    if (lenis) {
      const unsub = lenis.on('scroll', schedulePublishChrome);
      return () => {
        if (chromeState.rafId != null) {
          cancelAnimationFrame(chromeState.rafId);
          chromeState.rafId = null;
        }
        unsub();
      };
    }
    const onScroll = () => {
      schedulePublishChrome();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (chromeState.rafId != null) {
        cancelAnimationFrame(chromeState.rafId);
        chromeState.rafId = null;
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, [enabled, lenis, publishChrome, schedulePublishChrome]);

  useEffect(() => {
    if (!enabled) return;
    const hero = heroSectionRef.current;
    if (!hero) return;
    const chromeState = chromePublishRef.current;
    const ro = new ResizeObserver(() => {
      schedulePublishChrome();
    });
    ro.observe(hero);
    return () => {
      ro.disconnect();
      if (chromeState.rafId != null) {
        cancelAnimationFrame(chromeState.rafId);
        chromeState.rafId = null;
      }
    };
  }, [enabled, heroSectionRef, schedulePublishChrome]);

  useLayoutEffect(() => {
    if (!enabled || !lenis) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lenis.resize();
        publishChromeRef.current();
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [enabled, lenis]);
}
