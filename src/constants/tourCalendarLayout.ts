/** Макс. ширина кнопки дня в сетке `DayPicker` (`tour-calendar` day_button). */
export const TOUR_CALENDAR_DAY_CELL_MAX_WIDTH = '2.75rem' as const;

/** Сетка месяца: нативная `<table>` (react-day-picker v9), равные 7 колонок. */
export const TOUR_CALENDAR_MONTH_GRID_CLASS =
  'w-full min-w-0 table-fixed border-collapse' as const;

/** Заголовок дня недели (ПН…ВС) в `<th>`. */
export const TOUR_CALENDAR_WEEKDAY_CLASS =
  'p-0.5 pb-2 text-center text-xs font-body uppercase tracking-wide text-text-muted' as const;

/** Ячейка дня в сетке главного календаря (`<td>`). */
export const TOUR_CALENDAR_DAY_CELL_CLASS = 'p-0.5 text-center align-middle' as const;

/** Мин. высота панели «выберите дату» справа от календаря. */
export const TOUR_CALENDAR_DAY_PANEL_MIN_HEIGHT = '12rem' as const;

export const TOUR_CALENDAR_DAY_BUTTON_CLASS =
  'tour-calendar__day-btn mx-auto inline-flex aspect-square h-11 w-full max-w-tour-calendar-day-cell flex-col items-center justify-center overflow-hidden rounded-full font-body text-sm text-text-primary transition-colors duration-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-30 disabled:pointer-events-none' as const;

export const TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS =
  'flex min-h-tour-calendar-day-panel items-center justify-center rounded-card border border-dashed border-divider bg-surface-light/80 p-6 text-center' as const;

/** Заголовок выбранного дня в панели событий (glass над фоном секции). */
export const TOUR_CALENDAR_DAY_HEADING_CLASS =
  'mb-4 w-fit rounded-card border border-divider bg-surface-light/75 px-4 py-2 font-heading text-lg capitalize text-text-primary shadow-sm backdrop-blur-sm' as const;
