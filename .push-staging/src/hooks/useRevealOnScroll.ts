import { useCallback, useEffect, useState } from 'react';
import type { RefCallback } from 'react';
import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD } from '../constants/reveal';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export interface UseRevealOnScrollOptions {
  /** После первого появления отключить observer. */
  once?: boolean;
  /** Разрешить скрытие снова при выходе из viewport. */
  bidirectional?: boolean;
  /** Добавить directional-классы для enter/exit (по направлению скролла). */
  directional?: boolean;
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
    bidirectional = false,
    directional = false,
    threshold = REVEAL_THRESHOLD,
    rootMargin = REVEAL_ROOT_MARGIN,
    initialVisible = false,
    disabled = false,
  } = options;

  const reducedMotion = usePrefersReducedMotion();
  const noIntersectionObserver = typeof IntersectionObserver === 'undefined';

  const [intersected, setIntersected] = useState(initialVisible);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  const setRef: RefCallback<HTMLElement> = useCallback(node => {
    setElement(node);
  }, []);

  const isRevealed =
    Boolean(disabled) ||
    reducedMotion ||
    noIntersectionObserver ||
    intersected;

  useEffect(() => {
    if (disabled || reducedMotion || noIntersectionObserver || !element) return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setIntersected(true);
          if (once && !bidirectional) observer.disconnect();
          return;
        }
        if (bidirectional && !once) {
          setIntersected(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [bidirectional, disabled, element, noIntersectionObserver, once, reducedMotion, rootMargin, threshold]);

  useEffect(() => {
    if (!(directional || bidirectional)) return;
    if (typeof window === 'undefined') return;
    let previousScrollY = window.scrollY;
    const updateDirection = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === previousScrollY) return;
      setScrollDirection(currentScrollY > previousScrollY ? 'down' : 'up');
      previousScrollY = currentScrollY;
    };

    window.addEventListener('scroll', updateDirection, { passive: true });
    return () => window.removeEventListener('scroll', updateDirection);
  }, [bidirectional, directional]);

  const revealClassName = isRevealed ? 'reveal-visible' : 'reveal-hidden';
  const directionalRevealClassName = directional
    ? isRevealed
      ? scrollDirection === 'down'
        ? 'reveal-visible-from-bottom'
        : 'reveal-visible-from-top'
      : scrollDirection === 'up'
        ? 'reveal-hidden-to-top'
        : 'reveal-hidden-to-bottom'
    : revealClassName;

  return { ref: setRef, isRevealed, revealClassName, directionalRevealClassName, scrollDirection };
}
