import type { ClassNames } from 'react-day-picker';

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
  day_button:
    'flex h-full w-full max-w-[2.75rem] flex-col items-center justify-center rounded-lg aspect-square mx-auto font-body text-sm text-text-primary transition-colors hover:bg-surface-dark/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-30 disabled:pointer-events-none',
  outside: 'text-text-muted/40',
  today: 'font-semibold ring-1 ring-divider',
  selected: 'bg-season-spring/15 ring-2 ring-season-spring font-semibold',
  disabled: 'opacity-30 pointer-events-none',
  hidden: 'invisible',
};

export const tourCalendarModifierClassNames = {
  hasEvents: 'tour-calendar__day--has-events font-medium',
  tourDeparture: 'tour-calendar__day--departure font-semibold',
  nearest: 'tour-calendar__day--nearest ring-2',
} as const;
