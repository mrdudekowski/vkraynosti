import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCarouselOptions {
  total: number;
  autoplayMs?: number;
  resetKey?: string;
}

export const useCarousel = ({ total, autoplayMs = 0, resetKey }: UseCarouselOptions) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef(total);
  totalRef.current = total;

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
    setCurrent(0);
  }, [resetKey]);

  useEffect(() => {
    startAutoplayInterval();
    return () => clearAutoplay();
  }, [startAutoplayInterval, resetKey]);

  return { current, next, prev, goTo };
};
