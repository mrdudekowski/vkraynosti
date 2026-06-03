import type { Tour } from '../types';
import type { TourPublicationStatus } from '../types/tourSchedule';
import { resolveTourPublicationStatus } from '../utils/tourSchedule/resolveTourPublicationStatus';
import { useTourSchedule } from './useTourSchedule';

export function useTourPublicationStatus(
  tourId: string,
  staticInDevelopment?: boolean,
): TourPublicationStatus {
  const { publicationStatuses } = useTourSchedule();
  return resolveTourPublicationStatus(tourId, publicationStatuses, staticInDevelopment);
}

export function useIsTourHidden(tourId: string): boolean {
  return useTourPublicationStatus(tourId) === 'hidden';
}

export function useIsTourInDevelopment(tour: Pick<Tour, 'id' | 'inDevelopment'>): boolean {
  return useTourPublicationStatus(tour.id, tour.inDevelopment) === 'in_development';
}
