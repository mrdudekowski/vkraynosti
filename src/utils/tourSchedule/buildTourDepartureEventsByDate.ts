import type { EnrichedScheduleEvent, TourScheduleEvent } from '../../types/tourSchedule';
import { groupEventsByIsoDate } from './groupEventsByIsoDate';

const isCancelled = (event: TourScheduleEvent): boolean => event.status === 'cancelled';

/**
 * События одного тура по ISO-дате (для точек в модальном календаре выездов).
 */
export const buildTourDepartureEventsByDate = (
  tourId: string,
  events: EnrichedScheduleEvent[]
): Map<string, EnrichedScheduleEvent[]> => {
  const forTour = events.filter(event => event.tourId === tourId && !isCancelled(event));
  return groupEventsByIsoDate(forTour);
};
