import type { Tour } from '../types';
import type { TourPublicationStatus } from '../types/tourSchedule';
import { isTourInDevelopment } from './isTourInDevelopment';

/** Сохраняет порядок внутри групп; туры `in_development` — в конце списка. */
export function sortToursInDevelopmentLast(
  tours: readonly Tour[],
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus> = new Map(),
): Tour[] {
  const published: Tour[] = [];
  const inDevelopment: Tour[] = [];

  for (const tour of tours) {
    if (isTourInDevelopment(tour.id, publicationStatuses)) {
      inDevelopment.push(tour);
    } else {
      published.push(tour);
    }
  }

  return [...published, ...inDevelopment];
}
