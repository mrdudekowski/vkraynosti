/** Элемент и тайминги boot splash — синхронно с inline CSS в `index.html`. */
export const BOOT_SPLASH_ELEMENT_ID = 'app-boot-splash' as const;

/** `transitionDuration.hover` в `tailwind.config.ts`. */
export const BOOT_SPLASH_FADE_MS = 200 as const;

export const BOOT_SPLASH_FAILSAFE_MS = 10_000 as const;

/** `colors.surface.light` — фон splash до загрузки Tailwind. */
export const BOOT_SPLASH_SURFACE_LIGHT_HEX = '#F7F5F0' as const;

/** `colors.brand.primary` — «крайности» на светлом фоне. */
export const BOOT_SPLASH_WORDMARK_REST_HEX = '#1A3C2E' as const;

/** Интервал смены фразы и пузыря; sync с `public/boot-splash-runtime.js`. */
export const BOOT_SPLASH_STATUS_HOLD_MS = 1_400 as const;

/** Fade статуса; ориентир — `SAFETY_STATUS_FADE_MS`. */
export const BOOT_SPLASH_STATUS_FADE_MS = 180 as const;

/** Минимум видимости splash (2 фразы), чтобы анимация успела проиграться до React. */
export const BOOT_SPLASH_MIN_VISIBLE_MS = BOOT_SPLASH_STATUS_HOLD_MS * 2;

/** Пузыри прогресса загрузки; совпадает с числом `statusLines`. */
export const BOOT_SPLASH_BUBBLE_COUNT = 7 as const;

/** sessionStorage: splash уже показывали в этой вкладке — sync с inline script в `index.html`. */
export const BOOT_SPLASH_SESSION_SEEN_KEY = 'vk-app-booted' as const;
