import { useState } from 'react';

export function useAdminStoredState<T extends string>(
  storageKey: string,
  isValid: (value: string) => value is T,
): [T | null, (next: T) => void] {
  const [value, setValue] = useState<T | null>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw != null && isValid(raw) ? raw : null;
    } catch {
      return null;
    }
  });

  const setStored = (next: T) => {
    setValue(next);
    try {
      window.localStorage.setItem(storageKey, next);
    } catch {
      /* quota / private mode */
    }
  };

  return [value, setStored];
}
