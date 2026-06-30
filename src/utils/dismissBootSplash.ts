import {
  BOOT_SPLASH_ELEMENT_ID,
  BOOT_SPLASH_FADE_MS,
  BOOT_SPLASH_FAILSAFE_MS,
  BOOT_SPLASH_MIN_VISIBLE_MS,
} from '../constants/bootSplash';

const markAppReady = (): void => {
  document.documentElement.setAttribute('data-app-ready', '');
};

const removeSplash = (): void => {
  document.getElementById(BOOT_SPLASH_ELEMENT_ID)?.remove();
};

const finishBootSplash = (): void => {
  markAppReady();
  removeSplash();
};

/** Снимает boot splash после первого кадра React. */
export const dismissBootSplash = (): void => {
  if (document.documentElement.hasAttribute('data-skip-boot-splash')) {
    markAppReady();
    return;
  }

  window.__vkBootSplash?.markAppReady();

  const splash = document.getElementById(BOOT_SPLASH_ELEMENT_ID);
  if (splash == null) {
    finishBootSplash();
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishBootSplash();
    return;
  }

  splash.classList.add('boot-splash--hide');

  let settled = false;
  const settle = () => {
    if (settled) {
      return;
    }
    settled = true;
    finishBootSplash();
  };

  splash.addEventListener('transitionend', settle, { once: true });
  window.setTimeout(settle, BOOT_SPLASH_FADE_MS + 50);
};

export const scheduleBootSplashDismiss = (): void => {
  if (document.documentElement.hasAttribute('data-skip-boot-splash')) {
    dismissBootSplash();
    return;
  }

  const shownAt = window.__vkBootSplash?.getShownAt();
  const elapsed = shownAt != null && shownAt > 0 ? performance.now() - shownAt : 0;
  const delay = Math.max(0, BOOT_SPLASH_MIN_VISIBLE_MS - elapsed);

  window.setTimeout(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dismissBootSplash();
      });
    });
  }, delay);
};

export const installBootSplashFailsafe = (): void => {
  window.setTimeout(() => {
    dismissBootSplash();
  }, BOOT_SPLASH_FAILSAFE_MS);
};
