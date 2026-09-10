/**
 * Документ всегда в светлой палитре дизайн-системы.
 * Браузеры (Samsung Internet, Chrome) иначе накладывают forced dark mode при системной тёмной теме.
 * Исключение: favicon в shell-HTML — `media="(prefers-color-scheme: …)"`.
 */
export const DOCUMENT_COLOR_SCHEME = 'light only' as const;
