import { formatTourDurationDisplayLabel } from '../utils/tourSchedule/formatTourDurationDisplayLabel';
import type { TourScheduleDurationType } from '../types/tourSchedule';
import { useTourSchedule } from './useTourSchedule';

export interface TourDisplayDurationSource {
  id: string;
  /** @deprecated для UI — длительность из `durationTypes` каталога расписания */
  duration?: string;
}

export interface TourDisplayDuration {
  displayDuration: string;
  durationType: TourScheduleDurationType | null;
  fromCatalog: boolean;
}

export const useTourDisplayDuration = (
  tour: TourDisplayDurationSource
): TourDisplayDuration => {
  const { durationTypes, status } = useTourSchedule();
  const durationType = durationTypes.get(tour.id) ?? null;

  if (durationType != null) {
    return {
      displayDuration: formatTourDurationDisplayLabel(durationType),
      durationType,
      fromCatalog: true,
    };
  }

  if (status !== 'loading') {
    console.warn(`[tourSchedule] Missing catalog durationType for tourId: ${tour.id}`);
  }

  return {
    displayDuration: '',
    durationType: null,
    fromCatalog: false,
  };
};
