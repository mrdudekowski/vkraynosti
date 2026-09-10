import type { TourScheduleDurationType } from '../../types/tourSchedule';
import { formatTourDurationDisplayLabel } from './formatTourDurationDisplayLabel';

export interface TourDisplayDuration {
  displayDuration: string;
  durationType: TourScheduleDurationType | null;
  fromCatalog: boolean;
}

export function resolveTourDisplayDuration(
  durationType: TourScheduleDurationType | null,
  tourDuration: string | undefined,
): TourDisplayDuration {
  const displayDurationFromTour = tourDuration?.trim() ?? '';

  if (durationType != null) {
    return {
      displayDuration:
        displayDurationFromTour || formatTourDurationDisplayLabel(durationType),
      durationType,
      fromCatalog: true,
    };
  }

  return {
    displayDuration: displayDurationFromTour,
    durationType: null,
    fromCatalog: false,
  };
}
