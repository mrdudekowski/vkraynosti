/**
 * Параметры слоя-вуали (тёмный оверлей) над небом главной.
 * Цвет — `colors.home-season-banner-veil` в tailwind.config.ts; длительность — `transitionDuration.home-season-banner-veil`.
 *
 * Enter: максимум из сигнала по секции сезона и по секции контактов (раньше при скролле к кнопкам связи).
 * Exit: верх якоря в полосе («В другой сезон» + переключатель) ≤ 0 → вуаль 0 (`useHomeSeasonBannerWhiteVeil`).
 */

/** Пикселей прокрутки после касания низа вьюпорта с верхом секции — до полного «enter» сомножителя. */
export const HOME_SEASON_BANNER_VEIL_ENTER_RAMP_PX = 520;

/**
 * Ранний enter по `#contact`: нижний край секции подходит к низу вьюпорта; запас до старта нарастания (px).
 */
export const HOME_SEASON_BANNER_VEIL_CONTACT_LEAD_PX = 520;

/** Длина рампы enter по секции контактов (px). */
export const HOME_SEASON_BANNER_VEIL_CONTACT_ENTER_RAMP_PX = 640;

/**
 * По якорю выхода: пока top > 0, «exit» сомножитель ≈ 1; при top <= 0 opacity всегда 0.
 */
export const HOME_SEASON_BANNER_VEIL_EXIT_RAMP_PX = 400;

/** Длительность CSS `transition-opacity` слоя-вуали. */
export const HOME_SEASON_BANNER_WHITE_VEIL_TRANSITION_MS = 450;
