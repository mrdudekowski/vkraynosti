import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UI } from '../../constants/ui';

export const buildDayAriaLabel = (date: Date, eventCount: number): string => {
  const formatted = format(date, 'd MMMM', { locale: ru });
  if (eventCount <= 0) return formatted;
  return UI.tourCalendar.dayAriaLabel(formatted, eventCount);
};
