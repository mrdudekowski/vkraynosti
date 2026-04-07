/**
 * Тайминг баннера «В другой сезон» (главная, md+).
 * Синхронно с `transitionDuration` и анимацией волны в `tailwind.config.ts`.
 *
 * Каденция: все значения ускорены на 30% к предыдущему шагу (каждое ÷1.3, округление),
 * чтобы смена колонок с видео, crossfade и фаза слова оставались синхронными.
 */

/** Удержание полоски с видео/картинкой перед переходом к следующей колонке. */
export const HOME_SEASON_BANNER_MEDIA_VISIBLE_MS = 1132 as const;

/**
 * Crossfade соседних полосок (out+in одновременно).
 * Синхронно с `duration-home-season-banner-crossfade`.
 */
export const HOME_SEASON_BANNER_CROSSFADE_MS = 371 as const;

/** Fade in полоски (видео) после rAF. Синхронно с `duration-home-season-banner-strip-in`. */
export const HOME_SEASON_BANNER_STRIP_FADE_IN_MS = 309 as const;

/**
 * Fade in полного слова «Вкрайности» (после rAF в хуке).
 * Синхронно с `duration-home-season-banner-letter-in`.
 */
export const HOME_SEASON_BANNER_LETTER_FADE_IN_MS = 247 as const;

/**
 * Длительность анимации сноса одной буквы (волна + keyframes в теме).
 * Синхронно с `duration-home-season-banner-letter-exit` и `animate-home-season-banner-letter-wave-exit`.
 */
export const HOME_SEASON_BANNER_LETTER_EXIT_MS = 144 as const;

/**
 * Шаг волны сноса букв 9→0 (обычный режим).
 * Длительность одного шага анимации — `HOME_SEASON_BANNER_LETTER_EXIT_MS`.
 */
export const HOME_SEASON_BANNER_WORD_EXIT_WAVE_STAGGER_MS = 33 as const;

/** Пауза с полным словом (все буквы, включая «и») перед волной сноса. */
export const HOME_SEASON_BANNER_FULL_WORD_HOLD_MS = 2200 as const;

/** Пауза на чёрном после сноса слова до старта колонки 0 (новый цикл). */
export const HOME_SEASON_BANNER_CYCLE_GAP_MS = 206 as const;

/** Короткий зазор перед включением opacity полоски (см. хук). */
export const HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS = 8 as const;

/**
 * Переливание градиента у букв «Вкрайности» (фон только в глифах).
 * Синхронно с `animate-home-season-banner-wordmark-shimmer` в `tailwind.config.ts`.
 */
export const HOME_SEASON_BANNER_WORDMARK_SHIMMER_MS = 8200 as const;
