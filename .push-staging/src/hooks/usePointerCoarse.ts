import { useEffect, useState } from 'react';

/**
 * `true` для сенсорных / типичных мобильных вьюпортов (`pointer: coarse`).
 * Для тонкого указателя (мышь) — `false`.
 */
export function usePointerCoarse(): boolean {
  const [coarse, setCoarse] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return coarse;
}
