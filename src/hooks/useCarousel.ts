import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCarouselOptions {
  total: number;
  autoplayMs?: number;
}

export const useCarousel = ({ total, autoplayMs = 0 }: UseCarouselOptions) => {
  const [current, setCurrent] = useState(0);
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
    if (!autoplayMs) return;
    intervalRef.current = setInterval(() => {
      const n = totalRef.current;
      if (n <= 0) return;
      setCurrent(c => (c + 1) % n);
    }, autoplayMs);
  }, [autoplayMs, clearAutoplay]);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % total);
    startAutoplayInterval();
  }, [total, startAutoplayInterval]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + total) % total);
    startAutoplayInterval();
  }, [total, startAutoplayInterval]);

  const goTo = useCallback(
    (i: number) => {
      setCurrent(i);
      startAutoplayInterval();
    },
    [startAutoplayInterval]
  );

  useEffect(() => {
    startAutoplayInterval();
    return () => clearAutoplay();
  }, [startAutoplayInterval, clearAutoplay]);

  return { current, next, prev, goTo };
};
