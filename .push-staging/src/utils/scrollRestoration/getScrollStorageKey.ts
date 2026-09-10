import { SCROLL_RESTORATION_STORAGE_PREFIX } from '../../constants/scrollRestoration';

/** Ключ sessionStorage для pathname + search (без hash). */
export function getScrollStorageKey(pathname: string, search: string): string {
  return `${SCROLL_RESTORATION_STORAGE_PREFIX}${pathname}${search}`;
}
