/** Круглая ячейка дня мини-календаря (2rem, `.tour-calendar-mini`). */
export const TOUR_DEPARTURE_DAY_BUTTON_CLASS =
  'tour-calendar__day-btn inline-flex size-8 shrink-0 flex-col items-center justify-center rounded-full font-body text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-30 disabled:pointer-events-none' as const;

/** Маркер дня выезда на кнопке (без фона — только точки и :active). */
export const TOUR_DEPARTURE_DAY_DEPARTURE_CLASS = 'tour-departure-calendar__day--departure' as const;
