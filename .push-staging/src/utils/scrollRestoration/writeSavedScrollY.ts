/** Сохраняет Y в sessionStorage (F5 / reload той же страницы). */
export function writeSavedScrollY(storageKey: string, scrollY: number): void {
  if (typeof window === 'undefined') return;
  if (!Number.isFinite(scrollY) || scrollY < 0) return;
  try {
    sessionStorage.setItem(storageKey, String(Math.round(scrollY)));
  } catch {
    // quota / private mode — игнорируем
  }
}
