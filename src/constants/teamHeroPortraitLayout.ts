/** Портрет team-hero на mobile; синхронно с `maxHeight.team-hero-portrait-mobile`. */

export const TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT = 'clamp(20rem, 52vh, 32rem)' as const;



/** Портрет team-hero на desktop (полный кадр, без crop). */

export const TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT = 'clamp(22rem, 62vh, 48rem)' as const;



/** Горизонтальный gap между фото и bio на ≥768px; синхронно с `gap.team-hero-desktop`. */
export const TEAM_HERO_DESKTOP_COLUMN_GAP = '1.5rem' as const;

/** Максимальная ширина слайда team-hero на ≥768px; синхронно с `maxWidth.team-hero-slide`. */
export const TEAM_HERO_SLIDE_MAX_WIDTH = 'min(100%, 56rem)' as const;

/** Единый вертикальный отступ team-hero на mobile (≤767px). */
export const TEAM_HERO_MOBILE_VERTICAL_GAP = '2rem' as const;

/** Gap между article Элины и Ярослав на ≤767px; синхронно с `spacing.team-hero-members-stack-mobile`. */
export const TEAM_HERO_MEMBERS_STACK_GAP_MOBILE = '3rem' as const;

/** Вертикальный gap между фото и текстом в карточке на mobile. */
export const TEAM_HERO_SLIDE_MOBILE_ROW_GAP = TEAM_HERO_MOBILE_VERTICAL_GAP;

/**
 * Padding первого блока на md: stack gap 3rem + видимый зазор 2rem − подъём `TEAM_HERO_STAIRCASE_OFFSET_MD`.
 * `calc(offset - 1rem)` ≡ offset − stack + targetGap.
 */
export const TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_MD =
  'calc(clamp(6rem, 16vw, 10rem) - 1rem)' as const;

/**
 * Padding первого блока на lg+: stack gap 4rem + видимый зазор 2rem − подъём `TEAM_HERO_STAIRCASE_OFFSET_LG`.
 */
export const TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_LG =
  'calc(clamp(7rem, 14vw, 12rem) - 2rem)' as const;

/** Gap между блоками на team-hero-desktop (768px)–md; синхронно с `spacing.team-hero-members-stack`. */
export const TEAM_HERO_MEMBERS_STACK_GAP = '3rem' as const;

/** Gap между блоками на lg+; синхронно с `spacing.team-hero-members-stack-lg`. */
export const TEAM_HERO_MEMBERS_STACK_GAP_LG = '4rem' as const;

/** Подъём фото второго блока на md; синхронно с `spacing.team-hero-staircase-offset-md`. */
export const TEAM_HERO_STAIRCASE_OFFSET_MD = 'clamp(6rem, 16vw, 10rem)' as const;

/** Подъём фото второго блока на lg+; синхронно с `spacing.team-hero-staircase-offset-lg`. */
export const TEAM_HERO_STAIRCASE_OFFSET_LG = 'clamp(7rem, 14vw, 12rem)' as const;

/** Межстрочный интервал абзацев bio в team-hero; `leading-team-hero-bio`. */
export const TEAM_HERO_BIO_LINE_HEIGHT = '1.42' as const;

/** Участник с нижним выравниванием текстовой колонки на team-hero-desktop (photo-start). */
export const TEAM_HERO_MEMBER_ID_DESKTOP_TEXT_ALIGN_END = 'team-1' as const;

export type TeamHeroDesktopTextAlign = 'start' | 'end';
