import { startOfMonth } from 'date-fns';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { parseIsoDate } from './parseIsoDate';

export const getCalendarMonthFloor = (now: Date = new Date()): Date =>
  startOfMonth(now);

/**
 * Календарь: не показываем месяцы до текущего; «завершился» — только в текущем месяце.
 */
export const filterEventsForCalendarDisplay = (
  events: EnrichedScheduleEvent[],
  now: Date = new Date()
): EnrichedScheduleEvent[] => {
  const floor = getCalendarMonthFloor(now);

  return events.filter(event => {
    const date = parseIsoDate(event.date);
    const eventMonth = startOfMonth(date);

    if (eventMonth < floor) return false;
    if (event.status === 'completed' && eventMonth > floor) return false;

    return true;
  });
};
