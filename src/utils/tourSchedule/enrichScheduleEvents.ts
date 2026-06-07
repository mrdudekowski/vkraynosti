import { getTourById } from '../../data/toursData';
import type {
  EnrichedScheduleEvent,
  TourPublicationStatus,
  TourScheduleEvent,
} from '../../types/tourSchedule';
import { mapStatusLabel } from './mapStatusLabel';
import { resolveTourPublicationStatus } from './resolveTourPublicationStatus';

export const enrichScheduleEvents = (
  events: TourScheduleEvent[],
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus> = new Map(),
): EnrichedScheduleEvent[] => {
  const enriched: EnrichedScheduleEvent[] = [];
  const scheduleLoaded = true;

  for (const event of events) {
    if (event.status === 'cancelled') continue;

    if (
      resolveTourPublicationStatus(event.tourId, publicationStatuses, { scheduleLoaded }) ===
      'hidden'
    ) {
      continue;
    }

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
