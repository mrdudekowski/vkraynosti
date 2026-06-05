import type { TourPublicationStatus, TourScheduleEvent } from '../../types/tourSchedule';

/** Убирает выезды скрытых туров (defense in depth к GAS). */
export const filterEventsByPublicationStatuses = <T extends Pick<TourScheduleEvent, 'tourId'>>(
  events: readonly T[],
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
): T[] =>
  events.filter(event => publicationStatuses.get(event.tourId) !== 'hidden');
