import { parseIsoDate } from './parseIsoDate';

export const buildWeekDates = (anchorIso: string): Date[] => {
  const anchor = parseIsoDate(anchorIso);
  const day = anchor.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
};
