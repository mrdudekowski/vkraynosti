import type { TourPublicationStatus } from '../../types/tourSchedule';

export type ResolveTourPublicationStatusOptions = {
  scheduleLoaded: boolean;
};

/**
 * Publication status from GAS catalog (Sheets col F). Requires scheduleLoaded.
 * Missing id or empty catalog → hidden (strict SSOT).
 */
export function resolveTourPublicationStatus(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  options: ResolveTourPublicationStatusOptions,
): TourPublicationStatus | null {
  if (!options.scheduleLoaded) {
    return null;
  }

  if (publicationStatuses.size === 0) {
    return 'hidden';
  }

  return publicationStatuses.get(tourId) ?? 'hidden';
}

export function isTourPublicationHidden(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  scheduleLoaded: boolean,
): boolean {
  return (
    resolveTourPublicationStatus(tourId, publicationStatuses, { scheduleLoaded }) === 'hidden'
  );
}

/**
 * Hidden when schedule not loaded yet, catalog empty, status hidden, or id missing from catalog.
 */
export function isTourHiddenFromSite(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  scheduleLoaded: boolean,
): boolean {
  if (!scheduleLoaded) {
    return true;
  }

  if (publicationStatuses.size === 0) {
    return true;
  }

  const fromCatalog = publicationStatuses.get(tourId);
  if (fromCatalog === 'hidden') return true;
  if (fromCatalog === undefined) return true;
  return false;
}

export function isTourPublicationInDevelopment(
  tourId: string,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  scheduleLoaded: boolean,
): boolean {
  return (
    resolveTourPublicationStatus(tourId, publicationStatuses, { scheduleLoaded }) ===
    'in_development'
  );
}
