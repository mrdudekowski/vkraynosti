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
 * Splash при каждой «свежей» загрузке документа (Ctrl+F5, первый заход).
 * Без splash: bfcache, back/forward, HTML из cache (transferSize === 0).
 */
export const shouldShowBootSplash = ({
  navigation,
  pageshowPersisted = false,
}: {
  navigation: BootSplashNavigationSnapshot | null;
  pageshowPersisted?: boolean;
}): boolean => {
  if (pageshowPersisted) {
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
