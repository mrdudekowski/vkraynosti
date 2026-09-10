/**
 * Разметка карусели героя: активный слайд помечается для a11y и стилей.
 * Якорь скролла под навбар — верх `section#home-hero` (`computeHomeHeroMinScrollY` в `smoothScroll`).
 */

/** `id` секции героя на главной — один источник для разметки и программного скролла. */
export const HOME_HERO_SECTION_ELEMENT_ID = 'home-hero' as const;

export const DOM_DATA_HOME_HERO_ACTIVE_SLIDE = 'data-home-hero-active-slide' as const;
