import { useReducer, useEffect, useCallback, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseCarouselOptions {
  total: number;
  autoplayMs?: number;
}

type CarouselState = {
  current: number;
  visited: Set<number>;
};

type CarouselAction =
  | { type: 'next'; total: number }
  | { type: 'prev'; total: number }
  | { type: 'goTo'; total: number; index: number };

const carouselReducer = (state: CarouselState, action: CarouselAction): CarouselState => {
  const { total } = action;
  if (total <= 0) return state;

  let nextIdx: number;
  switch (action.type) {
    case 'next':
      nextIdx = (state.current + 1) % total;
      break;
    case 'prev':
      nextIdx = (state.current - 1 + total) % total;
      break;
    case 'goTo': {
      const clamped = Math.max(0, Math.min(action.index, total - 1));
      nextIdx = clamped;
      break;
    }
    default:
      return state;
  }

  return {
    current: nextIdx,
    visited: new Set(state.visited).add(nextIdx),
  };
};

const initialCarouselState = (total: number): CarouselState => ({
  current: 0,
  visited: new Set(total > 0 ? [0] : []),
});

export const useCarousel = ({ total, autoplayMs = 0 }: UseCarouselOptions) => {
  const reducedMotion = usePrefersReducedMotion();
  const [state, dispatch] = useReducer(carouselReducer, total, initialCarouselState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef(total);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  const clearAutoplay = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplayInterval = useCallback(() => {
    clearAutoplay();
    if (!autoplayMs || reducedMotion) return;
    intervalRef.current = setInterval(() => {
      const n = totalRef.current;
      if (n <= 0) return;
      dispatch({ type: 'next', total: n });
    }, autoplayMs);
  }, [autoplayMs, clearAutoplay, reducedMotion]);

  const next = useCallback(() => {
    dispatch({ type: 'next', total });
    startAutoplayInterval();
  }, [total, startAutoplayInterval]);

  const prev = useCallback(() => {
    dispatch({ type: 'prev', total });
    startAutoplayInterval();
  }, [total, startAutoplayInterval]);

  const goTo = useCallback(
    (i: number) => {
      dispatch({ type: 'goTo', total, index: i });
      startAutoplayInterval();
    },
    [total, startAutoplayInterval]
  );

  useEffect(() => {
    startAutoplayInterval();
    return () => clearAutoplay();
  }, [startAutoplayInterval, clearAutoplay]);

  return {
    current: state.current,
    visitedSlideIndices: state.visited,
    next,
    prev,
    goTo,
  };
};
