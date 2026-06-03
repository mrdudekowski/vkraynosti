/** Макс. ширина ячейки дня мини-календаря (2rem, `.tour-calendar-mini`). */
export const TOUR_DEPARTURE_DAY_CELL_MAX_WIDTH = '2rem' as const;

/** Заголовок дня недели в мини-календаре (`<th>`). */
export const TOUR_DEPARTURE_WEEKDAY_CLASS =
  'p-0.5 pb-1 text-center text-xs font-body uppercase tracking-wide text-text-muted' as const;

/** Ячейка дня в мини-календаре выездов (`<td>`). */
export const TOUR_DEPARTURE_DAY_CELL_CLASS = 'p-0.5 text-center align-middle' as const;

/** Круглая кнопка дня мини-календаря (2rem, `.tour-calendar-mini`). */
export const TOUR_DEPARTURE_DAY_BUTTON_CLASS =
  'tour-calendar__day-btn mx-auto inline-flex aspect-square h-8 w-full max-w-tour-departure-day-cell flex-col items-center justify-center overflow-hidden rounded-full font-body text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-30 disabled:pointer-events-none' as const;

/** Маркер дня выезда на кнопке (без фона — только точки и :active). */
export const TOUR_DEPARTURE_DAY_DEPARTURE_CLASS = 'tour-departure-calendar__day--departure' as const;
