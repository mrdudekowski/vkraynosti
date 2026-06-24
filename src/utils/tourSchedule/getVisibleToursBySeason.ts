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
    // Same rule as calendar/table: only `active` tours are listed publicly.
    // `in_development` pages stay reachable by URL (noindex); `hidden` → not-found.
    return fromCatalog === 'active';
  });
}
