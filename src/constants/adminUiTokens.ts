/**
 * Токены оболочки админки (SSOT → Tailwind `theme.extend`).
 * Витрина туриста эти значения не использует.
 */

export const ADMIN_BREAKPOINT_DESKTOP_PX = 1024 as const;
export const ADMIN_BREAKPOINT_WIDE_PX = 1440 as const;

export const ADMIN_SIDEBAR_EXPANDED_PX = 224 as const;
export const ADMIN_SIDEBAR_RAIL_PX = 68 as const;

export const ADMIN_INTERACTIVE_MS = 150 as const;

export const ADMIN_PAGE_TITLE_REM = 1.75 as const;
export const ADMIN_SECTION_TITLE_REM = 1.25 as const;

export const ADMIN_LAYOUT_COMPACT_PX = 640 as const;
export const ADMIN_LAYOUT_CONTENT_PX = 1200 as const;
export const ADMIN_LAYOUT_WIDE_PX = 1440 as const;

export const ADMIN_CONTROL_RADIUS_REM = 0.5 as const;
export const ADMIN_SURFACE_RADIUS_REM = 0.625 as const;
export const ADMIN_OVERLAY_RADIUS_REM = 0.75 as const;

/** Info/draft отдельно от brand green (спека §5). */
export const ADMIN_INFO_BG_HEX = '#E4EDF5' as const;
export const ADMIN_INFO_FG_HEX = '#1E3A5F' as const;
export const ADMIN_DRAFT_BG_HEX = '#EFEBE3' as const;
export const ADMIN_DRAFT_FG_HEX = '#5C5748' as const;

export const ADMIN_SIDEBAR_COLLAPSED_STORAGE_KEY = 'vkraynosti.admin.sidebarCollapsed' as const;
export const ADMIN_SCHEDULE_MODE_STORAGE_KEY = 'vkraynosti.admin.scheduleMode' as const;
export const ADMIN_SCHEDULE_WEEK_LAYOUT_STORAGE_KEY = 'vkraynosti.admin.scheduleWeekLayout' as const;
export const ADMIN_TOUR_LIST_VIEW_STORAGE_KEY = 'vkraynosti.admin.tourListView' as const;
export const ADMIN_INBOX_TAB_STORAGE_KEY = 'vkraynosti.admin.inboxTab' as const;
export const ADMIN_INBOX_SORT_STORAGE_KEY = 'vkraynosti.admin.inboxSort' as const;

export const ADMIN_TOAST_DURATION_MS = 4000 as const;
export const ADMIN_AUTOSAVE_DELAY_MS = 800 as const;

/** Подсказка длины коротких полей карточки (название, подзаголовок, hero). */
export const ADMIN_EDITOR_SHORT_TEXT_MAX = 80 as const;

/** Спека §71 Phase 5 / §10: обязательные ширины QA. */
export const ADMIN_QA_VIEWPORTS_PX = [1920, 1440, 1280, 1024, 768, 430, 390, 360] as const;

/** Минимальная высота sticky context bar — сдвиг тоста, чтобы не закрывать primary. */
export const ADMIN_STICKY_BAR_MIN_PX = 88 as const;
