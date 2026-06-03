import type { TourPublicationStatus } from '../../types/tourSchedule';

export function resolveTourPublicationStatus(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  /** @deprecated fallback из toursData, пока schedule не загрузился */
  staticInDevelopment?: boolean,
): TourPublicationStatus {
  const fromSchedule = publicationStatuses.get(tourId);
  if (fromSchedule) return fromSchedule;
  if (staticInDevelopment) return 'in_development';
  return 'active';
}

export function isTourPublicationHidden(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
): boolean {
  return resolveTourPublicationStatus(tourId, publicationStatuses) === 'hidden';
}

export function isTourPublicationInDevelopment(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  staticInDevelopment?: boolean,
): boolean {
  return (
    resolveTourPublicationStatus(tourId, publicationStatuses, staticInDevelopment) ===
    'in_development'
  );
}
