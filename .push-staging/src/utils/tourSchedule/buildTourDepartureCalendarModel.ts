import { startOfMonth } from 'date-fns';
import type { TourDepartureDateIso, TourScheduleEvent } from '../../types/tourSchedule';
import { getTourDepartureDates } from './getTourDepartureDates';
import { parseIsoDate } from './parseIsoDate';

export interface TourDepartureCalendarModel {
  /** Все даты выездов тура (без cancelled), отсортированы. */
  dates: TourDepartureDateIso[];
  futureDates: TourDepartureDateIso[];
  nearestFuture: TourDepartureDateIso | null;
  focusMonth: Date;
  isArchive: boolean;
  /** Дни с выездом для подсветки / выбора в календаре. */
  departureDateSet: ReadonlySet<TourDepartureDateIso>;
  /** Уникальные месяцы (начало месяца), в которых есть выезды, по возрастанию. */
  monthsWithDepartures: Date[];
}

const uniqueSortedMonths = (isoDates: TourDepartureDateIso[]): Date[] => {
  const byTime = new Map<number, Date>();

  for (const iso of isoDates) {
    const monthStart = startOfMonth(parseIsoDate(iso));
    byTime.set(monthStart.getTime(), monthStart);
  }

  return [...byTime.values()].sort((a, b) => a.getTime() - b.getTime());
};

export const isTourDepartureDate = (
  iso: string,
  departureDateSet: ReadonlySet<string>
): boolean => departureDateSet.has(iso);

/**
 * Модель данных для мини-календаря выездов одного тура (страница тура / модалка заявки).
 */
export const buildTourDepartureCalendarModel = (
  tourId: string,
  events: TourScheduleEvent[],
  today: Date = new Date()
): TourDepartureCalendarModel => {
  const departure = getTourDepartureDates(tourId, events, today);

  const highlightDates =
    departure.futureDates.length > 0 ? departure.futureDates : departure.dates;

  return {
    dates: departure.dates,
    futureDates: departure.futureDates,
    nearestFuture: departure.nearestFuture,
    focusMonth: departure.focusMonth,
    isArchive: departure.isArchive,
    departureDateSet: new Set(highlightDates),
    monthsWithDepartures: uniqueSortedMonths(highlightDates),
  };
};
