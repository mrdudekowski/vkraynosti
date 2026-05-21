import { getTourById } from '../../data/toursData';
import type { EnrichedScheduleEvent, TourScheduleEvent } from '../../types/tourSchedule';
import { mapStatusLabel } from './mapStatusLabel';

export const enrichScheduleEvents = (events: TourScheduleEvent[]): EnrichedScheduleEvent[] => {
  const enriched: EnrichedScheduleEvent[] = [];

  for (const event of events) {
    if (event.status === 'cancelled') continue;

    const tour = getTourById(event.tourId);
    if (!tour) {
      console.warn(`[tourSchedule] Unknown tourId: ${event.tourId}`);
      continue;
    }

    enriched.push({
      ...event,
      tour,
      season: tour.season,
      statusLabel: mapStatusLabel(event.status),
    });
  }

  return enriched;
};
