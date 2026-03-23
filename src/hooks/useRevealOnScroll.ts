import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RefCallback } from 'react';
import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD } from '../constants/reveal';

export interface UseRevealOnScrollOptions {
  /** После первого появления отключить observer. */
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  /** Видно сразу (above the fold / без ожидания IO). */
  initialVisible?: boolean;
  /** Отключить анимацию — всегда «видимо». */
  disabled?: boolean;
}

/**
 * Intersection Observer + классы `.reveal-*` из `index.css`.
 * Не использует layout-свойства; `prefers-reduced-motion` — мгновенный показ.
 */
export function useRevealOnScroll(options: UseRevealOnScrollOptions = {}) {
  const {
    once = true,
    threshold = REVEAL_THRESHOLD,
    rootMargin = REVEAL_ROOT_MARGIN,
    initialVisible = false,
    disabled = false,
  } = options;

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const noIntersectionObserver = useMemo(() => typeof IntersectionObserver === 'undefined', []);

  const [intersected, setIntersected] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  const setRef: RefCallback<HTMLElement> = useCallback(node => {
    setElement(node);
  }, []);

  const isRevealed =
    Boolean(disabled) ||
    Boolean(initialVisible) ||
    reducedMotion ||
    noIntersectionObserver ||
    intersected;

  useEffect(() => {
    if (isRevealed || !element) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIntersected(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, isRevealed, once, threshold, rootMargin]);

  const revealClassName = isRevealed ? 'reveal-visible' : 'reveal-hidden';

  return { ref: setRef, isRevealed, revealClassName };
}
