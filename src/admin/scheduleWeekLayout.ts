export const SCHEDULE_WEEK_LAYOUTS = ['list', 'split'] as const;
export type ScheduleWeekLayout = (typeof SCHEDULE_WEEK_LAYOUTS)[number];

export function isScheduleWeekLayout(value: string): value is ScheduleWeekLayout {
  return value === 'list' || value === 'split';
}

export function defaultSelectedDayInWeek(
  weekDays: readonly string[],
  todayIso: string,
  departureDates: ReadonlySet<string>,
): string {
  if (weekDays.includes(todayIso)) {
    return todayIso;
  }
  const withDepartures = weekDays.find((iso) => departureDates.has(iso));
  return withDepartures ?? weekDays[0] ?? todayIso;
}
