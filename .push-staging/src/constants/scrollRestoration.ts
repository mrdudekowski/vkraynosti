/** Префикс ключей sessionStorage: `scroll:${pathname}${search}` (hash не входит в ключ). */
export const SCROLL_RESTORATION_STORAGE_PREFIX = 'scroll:' as const;

/** Debounce сохранения Y при scroll / Lenis. */
export const SCROLL_RESTORATION_SAVE_DEBOUNCE_MS = 200 as const;

/** Максимальное ожидание роста layout (lazy-секции Home) перед restore. */
export const SCROLL_RESTORATION_MAX_RETRY_MS = 2000 as const;
