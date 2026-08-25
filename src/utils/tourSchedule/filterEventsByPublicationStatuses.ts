import type { TourPublicationStatus, TourScheduleEvent } from '../../types/tourSchedule';

/** Убирает будущие выезды скрытых туров (defense in depth к GAS). Прошедшие completed остаются. */
export const filterEventsByPublicationStatuses = <
  T extends Pick<TourScheduleEvent, 'tourId' | 'status'>,
>(
  events: readonly T[],
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
): T[] =>
  events.filter((event) => {
    if (publicationStatuses.get(event.tourId) !== 'hidden') {
      return true;
    }
    return event.status === 'completed';
  });
