/**
 * Брейкпоинты viewport (SSOT для Tailwind `screens` и JS `matchMedia`).
 *
 * | Tier        | Prefix | Min width |
 * |-------------|--------|-----------|
 * | X-Small     | —      | <576px    |
 * | Small       | sm     | ≥576px    |
 * | Medium      | md     | ≥768px    |
 * | Nav desktop | nav-desktop | ≥1160px (бургер ниже) |
 * | Large       | lg     | ≥992px    |
 * | Extra large | xl     | ≥1200px   |
 * | XXL         | 2xl    | ≥1400px   |
 *
 * Tablet UX (намеренные зоны, не баг):
 * - 500–1159: season switcher в navbar + burger, без desktop links (`season-md` / `nav-desktop`).
 */
export const BREAKPOINT_SM_PX = 576 as const;
export const BREAKPOINT_MD_PX = 768 as const;
export const BREAKPOINT_LG_PX = 992 as const;
export const BREAKPOINT_XL_PX = 1200 as const;
export const BREAKPOINT_2XL_PX = 1400 as const;

/** Секция «Команда»: desktop layout (grid + лесенка) с md; mobile — ≤767px. */
export const BREAKPOINT_TEAM_HERO_DESKTOP_PX = BREAKPOINT_MD_PX;

/**
 * Burger drawer: уже max-width с этой ширины viewport (~640, не sm 576).
 * Между sm и md — типичные планшеты в портрете.
 */
export const BREAKPOINT_MOBILE_NAV_DRAWER_COMPACT_PX = 640 as const;

/**
 * Min width для `nav-desktop:` (Navbar без бургера). Ниже — mobile/tablet navbar + скрытая полоса документа.
 * Синхронно `screens.nav-desktop` в `tailwind.config.ts`.
 */
export const BREAKPOINT_NAV_DESKTOP_PX = 1160 as const;

/**
 * Обложки spring-3 / spring-6: переход tight → wide (`object-position`).
 * Синхронно `screens.tour-cover-wide` в `tailwind.config.ts`.
 */
export const BREAKPOINT_TOUR_COVER_WIDE_PX = 620 as const;

/** `TourDetailMetaFacts`: две колонки с этой ширины. */
export const BREAKPOINT_META_MIN_PX = 320 as const;

export const BREAKPOINT_XS_PX = 360 as const;
export const BREAKPOINT_PHONE_PX = 375 as const;
export const BREAKPOINT_PHONE_LG_PX = 390 as const;
export const BREAKPOINT_TABLET_PX = 428 as const;

/** Подпись сезона в navbar и `SeasonSwitcher` (`season-md:`). */
export const BREAKPOINT_SEASON_MD_PX = 500 as const;

/** max-width для `season-below-md:` — на 1px ниже `season-md`. */
export const BREAKPOINT_SEASON_BELOW_MD_MAX_PX = BREAKPOINT_SEASON_MD_PX - 1;

/** max-width для `below-nav-desktop:` — на 1px ниже `nav-desktop`. */
export const BREAKPOINT_BELOW_NAV_DESKTOP_MAX_PX = BREAKPOINT_NAV_DESKTOP_PX - 1;

/** max-width для `team-hero-below-desktop:` — на 1px ниже `team-hero-desktop`. */
export const BREAKPOINT_TEAM_HERO_BELOW_DESKTOP_MAX_PX = BREAKPOINT_TEAM_HERO_DESKTOP_PX - 1;

/**
 * Min-width screens в `tailwind.config.ts` `theme.extend.screens`.
 * Ключ = имя префикса Tailwind.
 */
export const TAILWIND_SCREEN_MIN_WIDTH_PX = {
  sm: BREAKPOINT_SM_PX,
  md: BREAKPOINT_MD_PX,
  lg: BREAKPOINT_LG_PX,
  xl: BREAKPOINT_XL_PX,
  '2xl': BREAKPOINT_2XL_PX,
  'meta-min': BREAKPOINT_META_MIN_PX,
  'tour-cover-wide': BREAKPOINT_TOUR_COVER_WIDE_PX,
  xs: BREAKPOINT_XS_PX,
  phone: BREAKPOINT_PHONE_PX,
  'phone-lg': BREAKPOINT_PHONE_LG_PX,
  tablet: BREAKPOINT_TABLET_PX,
  'season-md': BREAKPOINT_SEASON_MD_PX,
  'nav-desktop': BREAKPOINT_NAV_DESKTOP_PX,
  'mobile-nav-drawer-compact': BREAKPOINT_MOBILE_NAV_DRAWER_COMPACT_PX,
  'team-hero-desktop': BREAKPOINT_TEAM_HERO_DESKTOP_PX,
} as const;

/**
 * Max-width screens (`{ max: 'Npx' }`) в `theme.extend.screens`.
 */
export const TAILWIND_SCREEN_MAX_WIDTH_PX = {
  'season-below-md': BREAKPOINT_SEASON_BELOW_MD_MAX_PX,
  'below-nav-desktop': BREAKPOINT_BELOW_NAV_DESKTOP_MAX_PX,
  'team-hero-below-desktop': BREAKPOINT_TEAM_HERO_BELOW_DESKTOP_MAX_PX,
} as const;

export type TailwindMinScreenName = keyof typeof TAILWIND_SCREEN_MIN_WIDTH_PX;
export type TailwindMaxScreenName = keyof typeof TAILWIND_SCREEN_MAX_WIDTH_PX;
