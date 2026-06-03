/** Ключ `localStorage` для выбора пользователя по cookies. */
export const COOKIE_CONSENT_STORAGE_KEY = 'vkraynosti:cookie-consent' as const;

/** Инкремент при смене политики — сброс баннера у записей со старой версией. */
export const COOKIE_CONSENT_VERSION = 1 as const;

export type CookieConsentRecord = {
  version: number;
  analytics: boolean;
  decidedAt: string;
};

/** Параметры инициализации счётчика (после согласия на аналитику). */
export const YANDEX_METRIKA_INIT_OPTIONS = {
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: true,
} as const;

export const YANDEX_METRIKA_SCRIPT_SRC = 'https://mc.yandex.ru/metrika/tag.js' as const;

export const YANDEX_METRIKA_SCRIPT_ATTR = 'data-vk-yandex-metrika' as const;
