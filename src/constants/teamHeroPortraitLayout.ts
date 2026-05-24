/** Портрет team-hero на mobile; синхронно с `maxHeight.team-hero-portrait-mobile`. */

export const TEAM_HERO_PORTRAIT_MOBILE_MAX_HEIGHT = 'clamp(20rem, 52vh, 32rem)' as const;



/** Портрет team-hero на desktop (полный кадр, без crop). */

export const TEAM_HERO_PORTRAIT_DESKTOP_MAX_HEIGHT = 'clamp(22rem, 62vh, 48rem)' as const;



/** Горизонтальный gap между фото и bio на sm+; синхронно с `gap.team-hero-desktop`. */
export const TEAM_HERO_DESKTOP_COLUMN_GAP = '1.5rem' as const;

/** Максимальная ширина слайда team-hero на sm+; синхронно с `maxWidth.team-hero-slide`. */
export const TEAM_HERO_SLIDE_MAX_WIDTH = 'min(100%, 56rem)' as const;

/** Единый вертикальный отступ team-hero на mobile (`< sm`). */
export const TEAM_HERO_MOBILE_VERTICAL_GAP = '2rem' as const;

/** Gap между блоками на mobile (`< sm`); синхронно с `spacing.team-hero-members-stack-mobile`. */
export const TEAM_HERO_MEMBERS_STACK_GAP_MOBILE = TEAM_HERO_MOBILE_VERTICAL_GAP;

/** Вертикальный gap между фото и текстом в карточке на mobile. */
export const TEAM_HERO_SLIDE_MOBILE_ROW_GAP = TEAM_HERO_MOBILE_VERTICAL_GAP;

/** Нижний padding первого блока на sm+ — компенсация «лесенки» + целевой gap. */
export const TEAM_HERO_FIRST_MEMBER_BOTTOM_PADDING_SM = TEAM_HERO_MOBILE_VERTICAL_GAP;

/** Gap между блоками на sm–md; синхронно с `spacing.team-hero-members-stack`. */
export const TEAM_HERO_MEMBERS_STACK_GAP = '3rem' as const;

/** Gap между блоками на lg+; синхронно с `spacing.team-hero-members-stack-lg`. */
export const TEAM_HERO_MEMBERS_STACK_GAP_LG = '4rem' as const;

/** Подъём фото второго блока («лесенка») на sm; синхронно с `spacing.team-hero-staircase-offset-sm`. */
export const TEAM_HERO_STAIRCASE_OFFSET_SM = 'clamp(5rem, 18vw, 8rem)' as const;

/** Подъём фото второго блока на md; синхронно с `spacing.team-hero-staircase-offset-md`. */
export const TEAM_HERO_STAIRCASE_OFFSET_MD = 'clamp(6rem, 16vw, 10rem)' as const;

/** Подъём фото второго блока на lg+; синхронно с `spacing.team-hero-staircase-offset-lg`. */
export const TEAM_HERO_STAIRCASE_OFFSET_LG = 'clamp(7rem, 14vw, 12rem)' as const;
