export const DEFAULT_DEPARTURE_SEATS = 8;
export const VLADIVOSTOK_TIME_ZONE = 'Asia/Vladivostok';
export type ScheduleMode = 'day' | 'week' | 'month';
export type ScheduleViewport = 'mobile' | 'tablet' | 'desktop';

export function isScheduleMode(value: string): value is ScheduleMode {
  return value === 'day' || value === 'week' || value === 'month';
}

export const SCHEDULE_CELL_VISIBLE_DEPARTURES = 1;
export const DASHBOARD_DAY_VISIBLE_DEPARTURES = 3;
export const SCHEDULE_OVERFLOW_AVATAR_LIMIT = 3;

export function defaultScheduleMode(viewport: ScheduleViewport): ScheduleMode {
  if (viewport === 'mobile') {
    return 'day';
  }
  if (viewport === 'tablet') {
    return 'week';
  }
  return 'month';
}

function utcDateFromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function isoFromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function vladivostokCalendarDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: VLADIVOSTOK_TIME_ZONE }).format(now);
}

export function addIsoDays(iso: string, days: number): string {
  const date = utcDateFromIso(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return isoFromUtc(date);
}

export function isoWeekdayMonday1(iso: string): number {
  const weekday = utcDateFromIso(iso).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

export function startOfIsoWeek(iso: string): string {
  return addIsoDays(iso, 1 - isoWeekdayMonday1(iso));
}

export function startOfIsoMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfIsoMonth(iso: string): string {
  const [year, month] = iso.split('-').map(Number);
  return isoFromUtc(new Date(Date.UTC(year, month, 0)));
}

export function scheduleVisibleDays(mode: ScheduleMode, cursorIso: string): string[] {
  if (mode === 'day') {
    return [cursorIso];
  }
  if (mode === 'week') {
    const start = startOfIsoWeek(cursorIso);
    return Array.from({ length: 7 }, (_, index) => addIsoDays(start, index));
  }
  const monthStart = startOfIsoMonth(cursorIso);
  const gridStart = startOfIsoWeek(monthStart);
  const gridEnd = startOfIsoWeek(endOfIsoMonth(cursorIso));
  const last = addIsoDays(gridEnd, 6);
  const days: string[] = [];
  for (let cursor = gridStart; cursor <= last; cursor = addIsoDays(cursor, 1)) {
    days.push(cursor);
  }
  return days;
}

export function formatChipRange(startsOn: string, endsOn: string | undefined): string {
  if (endsOn == null || endsOn === startsOn) {
    return startsOn;
  }
  return `${startsOn} – ${endsOn}`;
}

export function formatAgendaDay(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function shiftScheduleCursor(mode: ScheduleMode, cursorIso: string, direction: -1 | 1): string {
  if (mode === 'day') {
    return addIsoDays(cursorIso, direction);
  }
  if (mode === 'week') {
    return addIsoDays(cursorIso, direction * 7);
  }
  const [year, month] = cursorIso.split('-').map(Number);
  return isoFromUtc(new Date(Date.UTC(year, month - 1 + direction, 1)));
}
