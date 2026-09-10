import {
  resolveTourDisplayDuration,
  type TourDisplayDuration,
} from '../utils/tourSchedule/resolveTourDisplayDuration';
import { useTourSchedule } from './useTourSchedule';

export type { TourDisplayDuration };

export interface TourDisplayDurationSource {
  id: string;
  /** @deprecated для UI — длительность из `durationTypes` каталога расписания */
  duration?: string;
}

export const useTourDisplayDuration = (
  tour: TourDisplayDurationSource
): TourDisplayDuration => {
  const { durationTypes, status } = useTourSchedule();
  const durationType = durationTypes.get(tour.id) ?? null;

  if (durationType == null && status !== 'loading') {
    console.warn(`[tourSchedule] Missing catalog durationType for tourId: ${tour.id}`);
  }

  return resolveTourDisplayDuration(durationType, tour.duration);
};
