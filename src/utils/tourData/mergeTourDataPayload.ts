import type { TourSchedulePayload, TourScheduleEvent } from '../../types/tourSchedule';
import type { TourPublicationStatus } from '../../types/tourSchedule';
import type { PublicTour, ScheduleEvent, SchedulePayload, ToursListPayload } from '../../types/tourData';

export const mergeTourDataToSchedulePayload = (
  toursList: ToursListPayload,
  schedule: SchedulePayload,
): TourSchedulePayload => {
  const tourById = new Map(toursList.tours.map(tour => [tour.id, tour]));

  const catalogPrices: Record<string, number> = {};
  const catalogDurationTypes: Record<string, TourScheduleEvent['durationType']> = {};
  const catalogPublicationStatuses: Record<string, TourPublicationStatus> = {};

  for (const tour of toursList.tours) {
    catalogPublicationStatuses[tour.id] = tour.publicationStatus;
    catalogDurationTypes[tour.id] = tour.durationType;
    if (tour.priceRub != null) {
      catalogPrices[tour.id] = tour.priceRub;
    }
  }

  const events: TourScheduleEvent[] = [];

  for (const event of schedule.events) {
    const tour = tourById.get(event.tourId);
    if (tour != null && tour.publicationStatus === 'active') {
      events.push(hydrateScheduleEvent(event, tour));
      continue;
    }
    const offSite = hydrateOffSiteScheduleEvent(event);
    if (offSite == null) {
      continue;
    }
    catalogPublicationStatuses[event.tourId] = 'hidden';
    catalogDurationTypes[event.tourId] = offSite.durationType;
    if (offSite.priceRub != null) {
      catalogPrices[event.tourId] = offSite.priceRub;
    }
    events.push(offSite);
  }

  return {
    events,
    catalogPrices,
    catalogDurationTypes,
    catalogPublicationStatuses,
  };
};

export const hydrateScheduleEvent = (
  event: ScheduleEvent,
  tour: PublicTour,
): TourScheduleEvent => ({
  date: event.date,
  tourId: event.tourId,
  durationType: tour.durationType,
  priceRub: event.overridePriceRub ?? tour.priceRub,
  seats: event.seats,
  status: event.status,
  comment: event.comment,
});

const hydrateOffSiteScheduleEvent = (event: ScheduleEvent): TourScheduleEvent | null => {
  if (event.durationType == null) {
    return null;
  }
  return {
    date: event.date,
    tourId: event.tourId,
    durationType: event.durationType,
    priceRub: event.overridePriceRub ?? null,
    seats: event.seats,
    status: event.status,
    comment: event.comment,
  };
};
