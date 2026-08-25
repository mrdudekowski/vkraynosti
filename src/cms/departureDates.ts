import { addDays, parseISO } from 'date-fns';
import { toIsoDate } from '../utils/tourSchedule/toIsoDate';

export function departureEndDate(startIsoDate: string, durationDays: number): string {
  return toIsoDate(addDays(parseISO(startIsoDate), durationDays - 1));
}
