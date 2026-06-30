/** Элемент и тайминги boot splash — синхронно с inline CSS в `index.html`. */
export const BOOT_SPLASH_ELEMENT_ID = 'app-boot-splash' as const;

/** `transitionDuration.hover` в `tailwind.config.ts`. */
export const BOOT_SPLASH_FADE_MS = 200 as const;

export const BOOT_SPLASH_FAILSAFE_MS = 10_000 as const;

/** `colors.surface.light` — фон splash до загрузки Tailwind. */
export const BOOT_SPLASH_SURFACE_LIGHT_HEX = '#F7F5F0' as const;

/** `colors.brand.primary` — «крайности» на светлом фоне. */
export const BOOT_SPLASH_WORDMARK_REST_HEX = '#1A3C2E' as const;
