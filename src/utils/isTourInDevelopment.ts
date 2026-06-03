import type { Tour } from '../types';
import type { TourPublicationStatus } from '../types/tourSchedule';
import { isTourPublicationInDevelopment } from './tourSchedule/resolveTourPublicationStatus';

export function isTourInDevelopment(
  tour: Pick<Tour, 'id' | 'inDevelopment'>,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus> = new Map(),
): boolean {
  return isTourPublicationInDevelopment(tour.id, publicationStatuses, tour.inDevelopment);
}
