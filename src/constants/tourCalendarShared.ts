/** Единый класс выбранного дня для всех `DayPicker` с корнем `.tour-calendar`. */
export const TOUR_CALENDAR_DAY_SELECTED_CLASS = 'tour-calendar__day--selected' as const;

/** Цифра дня внутри кнопки (hover scale в `index.css`). */
export const TOUR_CALENDAR_DAY_NUMBER_CLASS = 'tour-calendar__day-num' as const;

/** Маркер ячейки `<td>` с событиями (фон только на кнопке, через точки). */
export const TOUR_CALENDAR_DAY_CELL_HAS_EVENTS_CLASS =
  'tour-calendar__day-cell--has-events' as const;
