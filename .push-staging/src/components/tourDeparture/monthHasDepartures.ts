import { endOfMonth, startOfMonth } from 'date-fns';
import { isTourDepartureDate } from '../../utils/tourSchedule/buildTourDepartureCalendarModel';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';

export const monthHasDepartures = (
  displayMonth: Date,
  departureDateSet: ReadonlySet<string>
): boolean => {
  if (departureDateSet.size === 0) return false;

  const monthStart = startOfMonth(displayMonth);
  const monthEnd = endOfMonth(displayMonth);

  for (const iso of departureDateSet) {
    const date = parseIsoDate(iso);
    if (date >= monthStart && date <= monthEnd) {
      return true;
    }
  }

  return false;
};

export const monthStartKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}`;

export const findMonthIndex = (months: Date[], displayMonth: Date): number =>
  months.findIndex(m => monthStartKey(m) === monthStartKey(displayMonth));

export const isoFromDate = (date: Date): string => toIsoDate(date);

export const dateHasDeparture = (
  date: Date,
  departureDateSet: ReadonlySet<string>
): boolean => isTourDepartureDate(toIsoDate(date), departureDateSet);
