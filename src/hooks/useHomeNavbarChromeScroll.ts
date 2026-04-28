import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import type { VirtualScrollData } from 'lenis';
import type Lenis from 'lenis';
import { useLenis } from 'lenis/react';
import {
  computeHomeNavbarChromeSnap,
  HOME_NAVBAR_CHROME_LAYOUT_DEFAULT,
  quantizeAxisPxForHomeNavbarChrome,
  type HomeNavbarChromeSnap,
} from '../constants/homeNavbarChrome';
import { HOME_HERO_CEILING_EPSILON_PX } from '../constants/homeHeroCeiling';
import {
  computeHomeHeroMinScrollY,
  getViewportScrollY,
} from '../constants/smoothScroll';
import { HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX } from '../constants/homeGateScroll';
import { useHomeNavbarChrome } from '../context/useHomeNavbarChrome';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface UseHomeNavbarChromeScrollOptions {
  heroSectionRef: RefObject<HTMLElement | null>;
  enabled: boolean;
}

function chromeSnapKey(s: HomeNavbarChromeSnap): string {
  return `${s.topChromeOpacity}|${s.topChromeSurfaceOpacity}|${s.mainUsesNavbarTopPadding}|${s.gateStageFullBleedMinHeight}|${s.disableTopChromeTransition}`;
}

function resolveLenisVirtualScrollDelta(lenis: Lenis, data: VirtualScrollData): number {
  const { deltaX, deltaY } = data;
  const { gestureOrientation } = lenis.options;
  if (gestureOrientation === 'both') {
    return Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
  }
  if (gestureOrientation === 'horizontal') {
    return deltaX;
  }
  return deltaY;
}

/** Вне React: Lenis требует патча `options.virtualScroll` на инстансе из контекста. */
type HomeNavbarCeilingVirtualScrollRefs = {
  heroSectionRef: RefObject<HTMLElement | null>;
  heroTopCeilingArmedRef: { current: boolean };
  heroCeilingMinLockRef: { current: number | null };
  heroTopCeilingMinScrollYRef: { current: number | null };
};

function installHomeNavbarCeilingVirtualScroll(
  lenisInstance: Lenis,
  refs: HomeNavbarCeilingVirtualScrollRefs,
): () => void {
  const prevVirtualScroll = lenisInstance.options.virtualScroll;
  lenisInstance.options.virtualScroll = (data: VirtualScrollData): boolean => {
    if (typeof prevVirtualScroll === 'function' && prevVirtualScroll(data) === false) {
      return false;
    }
    if ('ctrlKey' in data.event && data.event.ctrlKey) {
      return true;
    }

    const heroEl = refs.heroSectionRef.current;
    const scrollNow = lenisInstance.scroll;
    const heroMinRaw = computeHomeHeroMinScrollY(scrollNow, heroEl);
    if (heroMinRaw != null && scrollNow >= heroMinRaw - HOME_HERO_CEILING_EPSILON_PX) {
      refs.heroTopCeilingArmedRef.current = true;
    }

    const minY =
      refs.heroTopCeilingArmedRef.current && refs.heroCeilingMinLockRef.current != null
        ? refs.heroCeilingMinLockRef.current
        : heroMinRaw;
    refs.heroTopCeilingMinScrollYRef.current = minY;

    if (heroMinRaw == null || !refs.heroTopCeilingArmedRef.current || minY == null) {
      return true;
    }

    const delta = resolveLenisVirtualScrollDelta(lenisInstance, data);
    if (delta === 0) {
      return true;
    }

    const nextTarget = lenisInstance.targetScroll + delta;
    if (nextTarget >= minY - HOME_HERO_CEILING_EPSILON_PX) {
      return true;
    }

    if (data.event.cancelable) {
      data.event.preventDefault();
    }
    const y = lenisInstance.scroll;
    const tgt = lenisInstance.targetScroll;
    if (y < minY - HOME_HERO_CEILING_EPSILON_PX) {
      lenisInstance.scrollTo(minY, { immediate: true });
    } else if (tgt < minY - HOME_HERO_CEILING_EPSILON_PX) {
      lenisInstance.scrollTo(y, { immediate: true });
    }
    return false;
  };

  return () => {
    lenisInstance.options.virtualScroll = prevVirtualScroll;
  };
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
  const heroTopCeilingArmedRef = useRef(false);
  const heroTopCeilingMinScrollYRef = useRef<number | null>(null);
  /** Якорь потолка: фиксируется при первом arm в `publishChrome`. Сброс: resize hero, выход с главной. */
  const heroCeilingMinLockRef = useRef<number | null>(null);

  const publishChrome = useCallback(() => {
    if (!enabled) {
      heroTopCeilingArmedRef.current = false;
      heroTopCeilingMinScrollYRef.current = null;
      heroCeilingMinLockRef.current = null;
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

    let scrollRaw = getViewportScrollY(lenis);
    const heroMinRaw = computeHomeHeroMinScrollY(scrollRaw, heroSectionRef.current);

    const isAtGateTop = scrollRaw <= HOME_GATE_SCROLL_HINT_VISIBLE_MAX_SCROLL_PX;
    if (isAtGateTop && heroTopCeilingArmedRef.current) {
      heroTopCeilingArmedRef.current = false;
      heroTopCeilingMinScrollYRef.current = null;
      heroCeilingMinLockRef.current = null;
    }

    if (heroMinRaw != null && scrollRaw >= heroMinRaw - HOME_HERO_CEILING_EPSILON_PX) {
      heroTopCeilingArmedRef.current = true;
      if (heroCeilingMinLockRef.current == null) {
        heroCeilingMinLockRef.current = Math.round(heroMinRaw);
      }
    }
    const ceilingY =
      heroTopCeilingArmedRef.current && heroCeilingMinLockRef.current != null
        ? heroCeilingMinLockRef.current
        : heroMinRaw;
    heroTopCeilingMinScrollYRef.current = ceilingY;

    if (
      !lenis &&
      heroTopCeilingArmedRef.current &&
      ceilingY != null &&
      scrollRaw < ceilingY - HOME_HERO_CEILING_EPSILON_PX
    ) {
      window.scrollTo({ top: ceilingY, behavior: 'instant' });
      scrollRaw = ceilingY;
    }

    const scrollForChrome = quantizeAxisPxForHomeNavbarChrome(scrollRaw);
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

  /** У потолка: только снять инерцию / без подтягивания к линии. */
  const snapToHeroCeiling = useCallback(() => {
    if (lenis) {
      const y = lenis.scroll;
      lenis.scrollTo(y, { immediate: true });
      return;
    }
    const top = heroCeilingMinLockRef.current ?? heroTopCeilingMinScrollYRef.current;
    if (top == null) return;
    const y = window.scrollY;
    window.scrollTo({ top: Math.max(y, top), behavior: 'instant' });
  }, [lenis]);

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

  /**
   * Потолок: отмена wheel/touch delta «в пол» без подтягивания к линии.
   * Если скролл уже уехал ниже minY (инерция) — один immediate clamp; иначе только сброс target к текущему y.
   */
  useEffect(() => {
    if (!enabled || !lenis) return;
    return installHomeNavbarCeilingVirtualScroll(lenis, {
      heroSectionRef,
      heroTopCeilingArmedRef,
      heroCeilingMinLockRef,
      heroTopCeilingMinScrollYRef,
    });
  }, [enabled, lenis, heroSectionRef]);

  useEffect(() => {
    if (!enabled) return;

    const isCeilingBlockingActive = () => {
      if (!heroTopCeilingArmedRef.current) return false;
      const heroMin = heroTopCeilingMinScrollYRef.current;
      if (heroMin == null) return false;
      const currentScroll = getViewportScrollY(lenis);
      return currentScroll <= heroMin + HOME_HERO_CEILING_EPSILON_PX;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const triesToScrollUp =
        event.key === 'ArrowUp' ||
        event.key === 'PageUp' ||
        event.key === 'Home' ||
        (event.key === ' ' && event.shiftKey);
      if (!triesToScrollUp) return;
      if (!isCeilingBlockingActive()) return;
      event.preventDefault();
      event.stopPropagation();
      snapToHeroCeiling();
    };

    const previousHtmlOverscroll = document.documentElement.style.overscrollBehaviorY;
    const previousBodyOverscroll = document.body.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.overscrollBehaviorY = 'none';

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overscrollBehaviorY = previousHtmlOverscroll;
      document.body.style.overscrollBehaviorY = previousBodyOverscroll;
    };
  }, [enabled, lenis, snapToHeroCeiling]);

  useEffect(() => {
    if (!enabled) return;
    const hero = heroSectionRef.current;
    if (!hero) return;
    const chromeState = chromePublishRef.current;
    const ro = new ResizeObserver(() => {
      heroCeilingMinLockRef.current = null;
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
