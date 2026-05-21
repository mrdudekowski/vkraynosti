import { endOfWeek, format, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { parseIsoDate } from './parseIsoDate';

export interface WeekRange {
  start: Date;
  end: Date;
  label: string;
}

export const getWeekRangeForDate = (date: Date): WeekRange => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });

  const sameMonth = start.getMonth() === end.getMonth();
  const label = sameMonth
    ? `${format(start, 'd', { locale: ru })} – ${format(end, 'd MMMM', { locale: ru })}`
    : `${format(start, 'd MMM', { locale: ru })} – ${format(end, 'd MMM', { locale: ru })}`;

  return { start, end, label };
};

export const getWeekRangeForIsoDate = (iso: string): WeekRange =>
  getWeekRangeForDate(parseIsoDate(iso));
