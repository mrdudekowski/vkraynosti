import type { TourPublicationStatus } from '../types/tourSchedule';
import { isTourPublicationInDevelopment } from './tourSchedule/resolveTourPublicationStatus';

export function isTourInDevelopment(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus> = new Map(),
  scheduleLoaded = true,
): boolean {
  return isTourPublicationInDevelopment(tourId, publicationStatuses, scheduleLoaded);
}
