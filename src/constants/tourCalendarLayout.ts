/** Макс. ширина кнопки дня в сетке `DayPicker` (`tour-calendar` day_button). */
export const TOUR_CALENDAR_DAY_CELL_MAX_WIDTH = '2.75rem' as const;

/** Мин. высота панели «выберите дату» справа от календаря. */
export const TOUR_CALENDAR_DAY_PANEL_MIN_HEIGHT = '12rem' as const;

export const TOUR_CALENDAR_DAY_BUTTON_CLASS =
  `flex h-full w-full max-w-tour-calendar-day-cell flex-col items-center justify-center rounded-lg aspect-square mx-auto font-body text-sm text-text-primary transition-colors hover:bg-surface-dark/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-30 disabled:pointer-events-none` as const;

export const TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS =
  'flex min-h-tour-calendar-day-panel items-center justify-center rounded-card border border-dashed border-divider bg-surface-light/80 p-6 text-center' as const;
