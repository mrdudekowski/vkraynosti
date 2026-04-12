/**
 * Тайминг баннера «Вкрайности» на стартовом экране (главная).
 * Синхронно с `transitionDuration` и анимацией волны в `tailwind.config.ts`.
 *
 * Базовая каденция ускорена на 30% (каждое значение ×0.7, округление): смена колонок,
 * crossfade и фазы слова остаются синхронными.
 */

/**
 * Длительность воспроизведения видео в одной колонке баннера (секунды).
 * Совпадает с `durationSec` зимних клипов в `homeSeasonBannerClips.ts` и сегментом loop в `BannerColumnVideo`.
 */
export const HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC = 5 as const;

/**
 * Удержание полоски с видео/картинкой перед переходом к следующей колонке
 * (= время показа одного ролика в миллисекундах).
 */
export const HOME_SEASON_BANNER_MEDIA_VISIBLE_MS =
  HOME_SEASON_BANNER_COLUMN_VIDEO_PLAY_SEC * 1000;

/**
 * Crossfade соседних полосок (out+in одновременно).
 * Синхронно с `duration-home-season-banner-crossfade`.
 */
export const HOME_SEASON_BANNER_CROSSFADE_MS = 260 as const;

/** Fade in полоски (видео) после rAF. Синхронно с `duration-home-season-banner-strip-in`. */
export const HOME_SEASON_BANNER_STRIP_FADE_IN_MS = 216 as const;

/**
 * Fade in полного слова «Вкрайности» (после rAF в хуке).
 * Синхронно с `duration-home-season-banner-letter-in`.
 */
export const HOME_SEASON_BANNER_LETTER_FADE_IN_MS = 173 as const;

/**
 * Длительность анимации сноса одной буквы (волна + keyframes в теме).
 * Синхронно с `duration-home-season-banner-letter-exit` и `animate-home-season-banner-letter-wave-exit`.
 */
export const HOME_SEASON_BANNER_LETTER_EXIT_MS = 101 as const;

/**
 * Шаг волны сноса букв 9→0 (обычный режим).
 * Длительность одного шага анимации — `HOME_SEASON_BANNER_LETTER_EXIT_MS`.
 */
export const HOME_SEASON_BANNER_WORD_EXIT_WAVE_STAGGER_MS = 23 as const;

/** Пауза с полным словом (все буквы, включая «и») перед волной сноса. */
export const HOME_SEASON_BANNER_FULL_WORD_HOLD_MS = 1540 as const;

/** Пауза на чёрном после сноса слова до старта колонки 0 (новый цикл). */
export const HOME_SEASON_BANNER_CYCLE_GAP_MS = 144 as const;

/** Короткий зазор перед включением opacity полоски (см. хук). */
export const HOME_SEASON_BANNER_STRIP_ENTER_RAF_MS = 6 as const;

/**
 * Переливание градиента у букв «Вкрайности» (фон только в глифах).
 * Синхронно с `animate-home-season-banner-wordmark-shimmer` в `tailwind.config.ts`.
 */
export const HOME_SEASON_BANNER_WORDMARK_SHIMMER_MS = 5740 as const;
