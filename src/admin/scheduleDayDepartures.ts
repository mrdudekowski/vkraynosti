import {
  DASHBOARD_DAY_VISIBLE_DEPARTURES,
  SCHEDULE_CELL_VISIBLE_DEPARTURES,
  SCHEDULE_OVERFLOW_AVATAR_LIMIT,
} from './scheduleCalendar';

export {
  DASHBOARD_DAY_VISIBLE_DEPARTURES,
  SCHEDULE_CELL_VISIBLE_DEPARTURES,
  SCHEDULE_OVERFLOW_AVATAR_LIMIT,
};

export type DayDepartureGroup<T extends { startsOn: string }> = {
  startsOn: string;
  items: T[];
};

export function groupDeparturesByStartsOn<T extends { startsOn: string }>(
  departures: readonly T[],
): Array<DayDepartureGroup<T>> {
  const groups: Array<DayDepartureGroup<T>> = [];
  const indexByDate = new Map<string, number>();
  for (const departure of departures) {
    const existing = indexByDate.get(departure.startsOn);
    if (existing == null) {
      indexByDate.set(departure.startsOn, groups.length);
      groups.push({ startsOn: departure.startsOn, items: [departure] });
      continue;
    }
    groups[existing]?.items.push(departure);
  }
  return groups;
}

export function splitDayDepartures<T>(
  items: readonly T[],
  visibleCount: number,
): { visible: T[]; overflow: T[] } {
  return {
    visible: items.slice(0, visibleCount),
    overflow: items.slice(visibleCount),
  };
}
