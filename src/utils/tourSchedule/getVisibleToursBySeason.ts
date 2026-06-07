import { getToursBySeason } from '../../data/toursData';
import type { Season, Tour } from '../../types';
import type { TourPublicationStatus } from '../../types/tourSchedule';

export type GetVisibleToursBySeasonOptions = {
  /** Пока false — не показываем туры (ждём authoritative catalog из расписания). */
  scheduleLoaded?: boolean;
};

export function getVisibleToursBySeason(
  season: Season,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
  options?: GetVisibleToursBySeasonOptions,
): Tour[] {
  if (options?.scheduleLoaded !== true) {
    return [];
  }

  if (publicationStatuses.size === 0) {
    return [];
  }

  return getToursBySeason(season).filter(tour => {
    const fromCatalog = publicationStatuses.get(tour.id);
    if (fromCatalog === 'hidden') return false;
    if (fromCatalog === 'active' || fromCatalog === 'in_development') return true;
    return false;
  });
}
