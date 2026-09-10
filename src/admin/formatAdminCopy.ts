import { ADMIN_UI } from './constants/ui';
import { formatAgendaDay, isoWeekdayMonday1, VLADIVOSTOK_TIME_ZONE } from './scheduleCalendar';

export function formatAdminReadiness(ready: number, total: number): string {
  return `${ready}/${total} ${ADMIN_UI.readinessReady}`;
}

export function formatAdminBlockerCount(count: number): string {
  if (count <= 0) {
    return '';
  }
  if (count === 1) {
    return ADMIN_UI.blockersOne;
  }
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} ${ADMIN_UI.blockersFew}`;
  }
  return `${count} ${ADMIN_UI.blockersMany}`;
}

export function formatAdminCancelledThisWeek(count: number): string {
  if (count <= 0) {
    return '';
  }
  if (count === 1) {
    return ADMIN_UI.cancelledThisWeekOne;
  }
  return `${count} ${ADMIN_UI.cancelledThisWeekMany}`;
}

export function formatAdminOverflow(hiddenCount: number): string {
  if (hiddenCount <= 0) {
    return '';
  }
  return `+${hiddenCount} ${ADMIN_UI.scheduleOverflow}`;
}

function formatAdminRussianCount(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} ${one}`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} ${few}`;
  }
  return `${count} ${many}`;
}

export function formatScheduleOverflowDepartures(hiddenCount: number): string {
  if (hiddenCount <= 0) {
    return '';
  }
  const suffix = formatAdminRussianCount(
    hiddenCount,
    ADMIN_UI.scheduleOverflowDeparturesOne,
    ADMIN_UI.scheduleOverflowDeparturesFew,
    ADMIN_UI.scheduleOverflowDeparturesMany,
  ).replace(/^\d+\s+/, '');
  return `+${hiddenCount} ${suffix}`;
}

export function formatScheduleDepartureCount(count: number): string {
  return formatAdminRussianCount(
    count,
    ADMIN_UI.scheduleDepartureCountOne,
    ADMIN_UI.scheduleDepartureCountFew,
    ADMIN_UI.scheduleDepartureCountMany,
  );
}

export function formatScheduleMonthTitle(cursorIso: string): string {
  const [year, month] = cursorIso.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatScheduleAgendaDayLabel(iso: string): string {
  const weekday = ADMIN_UI.scheduleWeekdays[isoWeekdayMonday1(iso) - 1] ?? '';
  return `${formatAgendaDay(iso)} · ${weekday}`;
}

export function formatScheduleWeekdayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatScheduleSeatsTotal(seats: number): string {
  return `${seats} ${ADMIN_UI.scheduleSeatsTotal}`;
}

export function formatScheduleDayTitle(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatAdminOnSiteCount(onSite: number, total: number): string {
  return `${onSite} ${ADMIN_UI.onSiteCountOutOf} ${total} ${ADMIN_UI.onSiteCountSuffix}`;
}

export function formatAdminQueueDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatAdminAbsoluteTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: VLADIVOSTOK_TIME_ZONE,
  }).format(new Date(iso));
}

export function formatAdminRelativeTime(iso: string, now: Date = new Date()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) {
    return iso;
  }
  const deltaSeconds = Math.round((now.getTime() - then) / 1000);
  if (deltaSeconds < 45) {
    return ADMIN_UI.relativeJustNow;
  }
  if (deltaSeconds < 3600) {
    return `${Math.max(1, Math.round(deltaSeconds / 60))} ${ADMIN_UI.relativeMinutesAgo}`;
  }
  if (deltaSeconds < 86400) {
    return `${Math.max(1, Math.round(deltaSeconds / 3600))} ${ADMIN_UI.relativeHoursAgo}`;
  }
  return formatAdminAbsoluteTime(iso);
}

export function formatAdminCrossSeasonDepartureWarning(
  tourTitle: string,
  tourSeason: keyof typeof ADMIN_UI.seasons,
  calendarSeason: keyof typeof ADMIN_UI.seasons,
): string {
  return ADMIN_UI.scheduleCrossSeasonBody
    .replace('{tour}', tourTitle)
    .replace('{tourSeason}', ADMIN_UI.seasons[tourSeason])
    .replace('{calendarSeason}', ADMIN_UI.seasons[calendarSeason]);
}
