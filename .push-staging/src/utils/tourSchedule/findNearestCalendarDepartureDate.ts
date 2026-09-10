import { parseIsoDate } from './parseIsoDate';
import { toIsoDate } from './toIsoDate';

/** Ближайший день с выездом: сегодня или следующий; если все в прошлом — последний оставшийся. */
export const findNearestCalendarDepartureDate = (
  events: readonly { date: string }[],
  today: Date = new Date(),
): Date | undefined => {
  const dates = [...new Set(events.map(event => event.date))].sort();
  if (dates.length === 0) {
    return undefined;
  }

  const todayIso = toIsoDate(today);
  const nearestIso = dates.find(iso => iso >= todayIso) ?? dates[dates.length - 1];
  return parseIsoDate(nearestIso);
};
