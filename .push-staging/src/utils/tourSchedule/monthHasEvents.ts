import { endOfMonth, startOfMonth } from 'date-fns';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { parseIsoDate } from './parseIsoDate';

export const monthHasEvents = (
  year: number,
  monthIndex: number,
  events: EnrichedScheduleEvent[]
): boolean => {
  const monthStart = startOfMonth(new Date(year, monthIndex, 1));
  const monthEnd = endOfMonth(monthStart);

  return events.some(event => {
    const date = parseIsoDate(event.date);
    return date >= monthStart && date <= monthEnd;
  });
};
