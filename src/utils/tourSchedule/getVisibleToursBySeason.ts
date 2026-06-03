import { getToursBySeason } from '../../data/toursData';
import type { Season, Tour } from '../../types';
import type { TourPublicationStatus } from '../../types/tourSchedule';
import { resolveTourPublicationStatus } from './resolveTourPublicationStatus';

export function getVisibleToursBySeason(
  season: Season,
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>,
): Tour[] {
  return getToursBySeason(season).filter(
    tour =>
      resolveTourPublicationStatus(tour.id, publicationStatuses, tour.inDevelopment) !== 'hidden',
  );
}
