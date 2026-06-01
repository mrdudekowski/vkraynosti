import type { ClassNames } from 'react-day-picker';
import {
  TOUR_CALENDAR_DAY_CELL_CLASS,
  TOUR_CALENDAR_DAY_BUTTON_CLASS,
} from '../../constants/tourCalendarLayout';
import {
  TOUR_CALENDAR_DAY_CELL_HAS_EVENTS_CLASS,
  TOUR_CALENDAR_DAY_SELECTED_CLASS,
} from '../../constants/tourCalendarShared';

export const tourCalendarClassNames: Partial<ClassNames> = {
  root: 'tour-calendar rdp-root w-full min-w-0',
  months: 'flex min-w-0 flex-col gap-4',
  month: 'min-w-0 space-y-4',
  month_caption: 'hidden',
  nav: 'hidden',
  month_grid: 'w-full min-w-0 border-collapse',
  weekdays: 'flex min-w-0',
  weekday:
    'flex min-w-0 flex-1 text-center text-xs font-body uppercase tracking-wide text-text-muted pb-2',
  week: 'mt-1 flex w-full min-w-0',
  day: TOUR_CALENDAR_DAY_CELL_CLASS,
  day_button: TOUR_CALENDAR_DAY_BUTTON_CLASS,
  outside: 'text-text-muted/40',
  today: 'font-semibold',
  selected: TOUR_CALENDAR_DAY_SELECTED_CLASS,
  disabled: 'opacity-30 pointer-events-none',
  hidden: 'invisible',
};

export const tourCalendarModifierClassNames = {
  hasEvents: TOUR_CALENDAR_DAY_CELL_HAS_EVENTS_CLASS,
} as const;
