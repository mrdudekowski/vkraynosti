import { format, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Season } from '../../types';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';

interface TourCalendarMiniWeekStripProps {
  weekDates: Date[];
  focusMonth: Date;
  departureDates: Set<string>;
  nearestIso: string | null;
  season: Season;
}

const SEASON_TEXT_CLASS: Record<Season, string> = {
  winter: 'text-season-winter',
  spring: 'text-season-spring',
  summer: 'text-season-summer',
  fall: 'text-season-fall',
};

const toIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const TourCalendarMiniWeekStrip = ({
  weekDates,
  focusMonth,
  departureDates,
  nearestIso,
  season,
}: TourCalendarMiniWeekStripProps) => (
  <div className="mb-3 grid grid-cols-7 gap-1 text-center" aria-hidden>
    {weekDates.map(date => {
      const iso = toIso(date);
      const isDeparture = departureDates.has(iso);
      const isNearest = nearestIso === iso;
      const outsideMonth = !isSameMonth(date, focusMonth);

      return (
        <div key={iso} className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] uppercase text-text-muted">
            {format(date, 'EEEEE', { locale: ru })}
          </span>
          <span
            className={[
              'inline-flex size-7 items-center justify-center rounded-md text-xs tabular-nums',
              outsideMonth ? 'text-text-muted/40' : 'text-text-primary',
              isDeparture ? `font-semibold ${SEASON_TEXT_CLASS[season]}` : '',
              isNearest ? 'ring-2 ring-brand-primary' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {date.getDate()}
          </span>
        </div>
      );
    })}
  </div>
);

export default TourCalendarMiniWeekStrip;

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
