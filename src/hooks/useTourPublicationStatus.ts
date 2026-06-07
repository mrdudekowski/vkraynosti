import type { TourPublicationStatus } from '../types/tourSchedule';
import { resolveTourPublicationStatus } from '../utils/tourSchedule/resolveTourPublicationStatus';
import { useTourSchedule } from './useTourSchedule';

export function useTourPublicationStatus(tourId: string): TourPublicationStatus | null {
  const { publicationStatuses, status } = useTourSchedule();
  const scheduleLoaded = status === 'success';
  return resolveTourPublicationStatus(tourId, publicationStatuses, { scheduleLoaded });
}

export function useIsTourHidden(tourId: string): boolean {
  const { publicationStatuses, status } = useTourSchedule();
  const scheduleLoaded = status === 'success';
  return (
    resolveTourPublicationStatus(tourId, publicationStatuses, { scheduleLoaded }) === 'hidden'
  );
}

export function useIsTourInDevelopment(tourId: string): boolean {
  return useTourPublicationStatus(tourId) === 'in_development';
}
