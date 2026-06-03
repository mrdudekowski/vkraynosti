import type { ClassNames } from 'react-day-picker';
import {
  TOUR_DEPARTURE_DAY_BUTTON_CLASS,
  TOUR_DEPARTURE_DAY_CELL_CLASS,
  TOUR_DEPARTURE_DAY_DEPARTURE_CLASS,
  TOUR_DEPARTURE_WEEKDAY_CLASS,
} from '../../constants/tourDepartureCalendar';
import {
  TOUR_CALENDAR_MONTH_GRID_CLASS,
} from '../../constants/tourCalendarLayout';
import { TOUR_CALENDAR_DAY_SELECTED_CLASS } from '../../constants/tourCalendarShared';

export const tourDepartureCalendarClassNames: Partial<ClassNames> = {
  root: 'tour-calendar tour-calendar-mini tour-departure-calendar rdp-root w-full min-w-0',
  months: 'flex min-w-0 flex-col gap-2',
  month: 'min-w-0 space-y-2',
  month_caption: 'hidden',
  nav: 'hidden',
  month_grid: TOUR_CALENDAR_MONTH_GRID_CLASS,
  weekdays: '',
  weekday: TOUR_DEPARTURE_WEEKDAY_CLASS,
  week: '',
  day: TOUR_DEPARTURE_DAY_CELL_CLASS,
  day_button: TOUR_DEPARTURE_DAY_BUTTON_CLASS,
  outside: 'text-text-muted/40',
  today: 'font-semibold',
  selected: TOUR_CALENDAR_DAY_SELECTED_CLASS,
  disabled: 'opacity-30 pointer-events-none',
  hidden: 'invisible',
};

/** На `<td>` — без фона (круг рисуется только на кнопке). */
export const tourDepartureModifierClassNames = {
  hasDeparture: 'tour-departure-calendar__day-cell',
} as const;

export { TOUR_DEPARTURE_DAY_DEPARTURE_CLASS };
