import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import { SCROLL_RESTORATION_SAVE_DEBOUNCE_MS } from '../constants/scrollRestoration';
import { getViewportScrollY } from '../constants/smoothScroll';
import { useModal } from '../context/useModal';
import {
  getScrollStorageKey,
  isReloadNavigation,
  isScrollRestorationEligiblePath,
  readSavedScrollY,
  restoreViewportScrollY,
  writeSavedScrollY,
} from '../utils/scrollRestoration';

/**
 * Сохраняет Y в sessionStorage (debounced) и восстанавливает после F5 той же страницы.
 * Hash в URL не входит в ключ; якорная навигация — в `ScrollToTopOnNavigate`.
 */
export function useScrollRestoration(): void {
  const location = useLocation();
  const lenis = useLenis();
  const { modal } = useModal();
  const restoredRef = useRef(false);
  const storageKey = getScrollStorageKey(location.pathname, location.search);
  const modalOpen = modal.type != null;

  useEffect(() => {
    if (!isScrollRestorationEligiblePath(location.pathname)) return;

    let debounceId: ReturnType<typeof setTimeout> | null = null;

    const persist = (): void => {
      if (modalOpen) return;
      writeSavedScrollY(storageKey, getViewportScrollY(lenis));
    };

    const scheduleSave = (): void => {
      if (modalOpen) return;
      if (debounceId != null) clearTimeout(debounceId);
      debounceId = setTimeout(persist, SCROLL_RESTORATION_SAVE_DEBOUNCE_MS);
    };

    const flushSave = (): void => {
      if (debounceId != null) clearTimeout(debounceId);
      debounceId = null;
      persist();
    };

    lenis?.on('scroll', scheduleSave);
    window.addEventListener('scroll', scheduleSave, { passive: true });
    window.addEventListener('pagehide', flushSave);

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'hidden') flushSave();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      if (debounceId != null) clearTimeout(debounceId);
      lenis?.off('scroll', scheduleSave);
      window.removeEventListener('scroll', scheduleSave);
      window.removeEventListener('pagehide', flushSave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [lenis, location.pathname, modalOpen, storageKey]);

  useLayoutEffect(() => {
    if (restoredRef.current) return;
    if (!isReloadNavigation()) return;
    if (!isScrollRestorationEligiblePath(location.pathname)) return;

    const savedY = readSavedScrollY(storageKey);
    if (savedY == null || savedY <= 0) return;

    restoredRef.current = true;
    restoreViewportScrollY(lenis, savedY);
  }, [lenis, location.pathname, storageKey]);
}
