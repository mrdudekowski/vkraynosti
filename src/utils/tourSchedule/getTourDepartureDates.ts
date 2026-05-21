import { startOfMonth } from 'date-fns';
import type { TourScheduleEvent } from '../../types/tourSchedule';
import { parseIsoDate } from './parseIsoDate';
import { toIsoDate } from './toIsoDate';

export interface TourDepartureDatesResult {
  dates: string[];
  nearestFuture: string | null;
  focusMonth: Date;
  isArchive: boolean;
}

export const getTourDepartureDates = (
  tourId: string,
  events: TourScheduleEvent[],
  today: Date = new Date()
): TourDepartureDatesResult => {
  const todayIso = toIsoDate(today);

  const dates = events
    .filter(e => e.tourId === tourId && e.status !== 'cancelled')
    .map(e => e.date)
    .sort();

  const futureDates = dates.filter(iso => iso >= todayIso);
  const nearestFuture = futureDates[0] ?? null;

  const focusIso = nearestFuture ?? dates[dates.length - 1] ?? todayIso;
  const focusMonth = startOfMonth(parseIsoDate(focusIso));

  return {
    dates,
    nearestFuture,
    focusMonth,
    isArchive: nearestFuture === null && dates.length > 0,
  };
};
