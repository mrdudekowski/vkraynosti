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

/**
 * Скрыт с сайта, когда расписание загружено и в каталоге статус hidden
 * или тура нет в publicationStatuses при непустом каталоге.
 */
export function isTourHiddenFromSite(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  scheduleLoaded: boolean,
): boolean {
  if (!scheduleLoaded) return false;

  if (publicationStatuses.size === 0) return true;

  const fromCatalog = publicationStatuses.get(tourId);
  if (fromCatalog === 'hidden') return true;
  if (fromCatalog === undefined) return true;
  return false;
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
