import { BOOT_SPLASH_SESSION_SEEN_KEY } from '../constants/bootSplash';

export interface BootSplashNavigationSnapshot {
  type: string;
  transferSize: number;
  decodedBodySize: number;
}

/** Страница пришла из HTTP/disk cache (не свежая сеть). */
export const isNavigationFromPageCache = (
  navigation: BootSplashNavigationSnapshot,
): boolean => navigation.transferSize === 0 && navigation.decodedBodySize > 0;

/**
 * Показывать boot splash только на первом «холодном» заходе в сессии:
 * не bfcache, не back/forward, не reload из cache, ещё не было успешного входа.
 */
export const shouldShowBootSplash = ({
  sessionAlreadyBooted,
  navigation,
  pageshowPersisted = false,
}: {
  sessionAlreadyBooted: boolean;
  navigation: BootSplashNavigationSnapshot | null;
  pageshowPersisted?: boolean;
}): boolean => {
  if (pageshowPersisted || sessionAlreadyBooted) {
    return false;
  }

  if (navigation == null) {
    return true;
  }

  if (navigation.type === 'back_forward') {
    return false;
  }

  if (isNavigationFromPageCache(navigation)) {
    return false;
  }

  return true;
};

export const readBootSplashSessionSeen = (): boolean => {
  try {
    return sessionStorage.getItem(BOOT_SPLASH_SESSION_SEEN_KEY) === '1';
  } catch {
    return false;
  }
};

export const markBootSplashSeen = (): void => {
  try {
    sessionStorage.setItem(BOOT_SPLASH_SESSION_SEEN_KEY, '1');
  } catch {
    // private mode / blocked storage
  }
};
