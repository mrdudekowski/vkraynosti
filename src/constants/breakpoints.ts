/**
 * Брейкпоинты viewport (SSOT для Tailwind `screens` и JS `matchMedia`).
 *
 * | Tier        | Prefix | Min width |
 * |-------------|--------|-----------|
 * | X-Small     | —      | <576px    |
 * | Small       | sm     | ≥576px    |
 * | Medium      | md     | ≥768px    |
 * | Large       | lg     | ≥992px    |
 * | Extra large | xl     | ≥1200px   |
 * | XXL         | 2xl    | ≥1400px   |
 */
export const BREAKPOINT_SM_PX = 576 as const;
export const BREAKPOINT_MD_PX = 768 as const;
export const BREAKPOINT_LG_PX = 992 as const;
export const BREAKPOINT_XL_PX = 1200 as const;
export const BREAKPOINT_2XL_PX = 1400 as const;

/** Секция «Команда»: desktop layout (grid + лесенка) с этой ширины (≤649px — mobile). */
export const BREAKPOINT_TEAM_HERO_DESKTOP_PX = 650 as const;
