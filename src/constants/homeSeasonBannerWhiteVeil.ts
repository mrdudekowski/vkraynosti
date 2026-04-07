/**
 * Параметры слоя-вуали (тёмный оверлей) над небом главной.
 * Цвет — `colors.home-season-banner-veil` в tailwind.config.ts; длительность — `transitionDuration.home-season-banner-veil`.
 *
 * Логика: нарастание после касания низом вьюпорта верха секции сезонной полосы; спад до 0, когда верх `#team`
 * достигает верха вьюпорта (`useHomeSeasonBannerWhiteVeil`).
 */

/** Пикселей прокрутки после касания низа вьюпорта с верхом секции — до полного «enter» сомножителя. */
export const HOME_SEASON_BANNER_VEIL_ENTER_RAMP_PX = 520;

/**
 * По `teamSection.getBoundingClientRect().top`: пока top > этого значения, «exit» сомножитель ≈ 1;
 * при приближении к 0 вуаль гаснет; при top <= 0 opacity всегда 0.
 */
export const HOME_SEASON_BANNER_VEIL_EXIT_RAMP_PX = 400;

/** Длительность CSS `transition-opacity` слоя-вуали. */
export const HOME_SEASON_BANNER_WHITE_VEIL_TRANSITION_MS = 450;
