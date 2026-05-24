/** Портрет team-hero на mobile; синхронно с `maxHeight.team-hero-portrait-mobile`. */

export const TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT = 'clamp(20rem, 52vh, 32rem)' as const;



/** Портрет team-hero на desktop (полный кадр, без crop). */

export const TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT = 'clamp(22rem, 62vh, 48rem)' as const;



/** Горизонтальный gap между фото и bio на sm+; синхронно с `gap.team-hero-desktop`. */
export const TEAM_HERO_DESKTOP_COLUMN_GAP = '1.5rem' as const;

/** Максимальная ширина слайда team-hero на sm+; синхронно с `maxWidth.team-hero-slide`. */
export const TEAM_HERO_SLIDE_MAX_WIDTH = 'min(100%, 56rem)' as const;
