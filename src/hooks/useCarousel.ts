import { useState, useEffect, useCallback } from 'react';

interface UseCarouselOptions {
  total: number;
  autoplayMs?: number;
}

export const useCarousel = ({ total, autoplayMs = 0 }: UseCarouselOptions) => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);
  const goTo = useCallback((i: number) => setCurrent(i), []);

  useEffect(() => {
    if (!autoplayMs) return;
    const id = setInterval(next, autoplayMs);
    return () => clearInterval(id);
  }, [next, autoplayMs]);

  return { current, next, prev, goTo };
};
