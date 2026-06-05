import { getToursBySeason } from '../../data/toursData';
import type { Season, Tour } from '../../types';
import type { TourPublicationStatus } from '../../types/tourSchedule';
import { resolveTourPublicationStatus } from './resolveTourPublicationStatus';

export type GetVisibleToursBySeasonOptions = {
  /** Пока false — не показываем туры (пустая map иначе = все «активен»). */
  scheduleLoaded?: boolean;
};

export function getVisibleToursBySeason(
  season: Season,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  options?: GetVisibleToursBySeasonOptions,
): Tour[] {
  if (options?.scheduleLoaded === false) {
    return [];
  }

  const catalogHasStatuses = publicationStatuses.size > 0;

  return getToursBySeason(season).filter(tour => {
    const fromCatalog = publicationStatuses.get(tour.id);
    if (fromCatalog === 'hidden') return false;
    if (fromCatalog === 'active' || fromCatalog === 'in_development') return true;

    if (catalogHasStatuses) {
      return false;
    }

    return (
      resolveTourPublicationStatus(tour.id, publicationStatuses, tour.inDevelopment) !==
      'hidden'
    );
  });
}
