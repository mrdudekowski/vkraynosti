/** Читает сохранённый Y из sessionStorage; `null`, если нет или значение некорректно. */
export function readSavedScrollY(storageKey: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (raw == null) return null;
    const y = Number.parseFloat(raw);
    if (!Number.isFinite(y) || y < 0) return null;
    return y;
  } catch {
    return null;
  }
}

export function hasSavedScrollY(storageKey: string): boolean {
  return readSavedScrollY(storageKey) != null;
}
