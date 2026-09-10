import { useMemo } from 'react';
import { useTourSchedule } from './useTourSchedule';
import { filterEventsForCalendarDisplay } from '../utils/tourSchedule/filterEventsForCalendarDisplay';
import { groupEventsByIsoDate } from '../utils/tourSchedule/groupEventsByIsoDate';

export const useTourScheduleCalendarEvents = () => {
  const schedule = useTourSchedule();

  const events = useMemo(
    () => filterEventsForCalendarDisplay(schedule.events),
    [schedule.events]
  );

  const eventsByDate = useMemo(() => groupEventsByIsoDate(events), [events]);

  return {
    ...schedule,
    events,
    eventsByDate,
  };
};
