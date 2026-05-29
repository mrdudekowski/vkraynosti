import type { ClassNames } from 'react-day-picker';
import { TOUR_CALENDAR_DAY_BUTTON_CLASS } from '../../constants/tourCalendarLayout';
import {
  TOUR_CALENDAR_DAY_CELL_HAS_EVENTS_CLASS,
  TOUR_CALENDAR_DAY_SELECTED_CLASS,
} from '../../constants/tourCalendarShared';

export const tourCalendarClassNames: Partial<ClassNames> = {
  root: 'tour-calendar rdp-root w-full',
  months: 'flex flex-col gap-4',
  month: 'space-y-4',
  month_caption: 'hidden',
  nav: 'hidden',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday:
    'flex-1 text-center text-xs font-body uppercase tracking-wide text-text-muted pb-2',
  week: 'flex w-full mt-1',
  day: 'flex flex-1 items-center justify-center p-0.5',
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
