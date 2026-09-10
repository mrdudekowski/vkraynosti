import type { EnrichedScheduleEvent } from '../../types/tourSchedule';

export const groupEventsByIsoDate = (
  events: EnrichedScheduleEvent[]
): Map<string, EnrichedScheduleEvent[]> => {
  const map = new Map<string, EnrichedScheduleEvent[]>();

  for (const event of events) {
    const bucket = map.get(event.date);
    if (bucket) {
      bucket.push(event);
    } else {
      map.set(event.date, [event]);
    }
  }

  return map;
};
