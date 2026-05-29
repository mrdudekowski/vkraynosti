import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UI } from '../../constants/ui';
import TourCalendarChevron from '../tourCalendar/TourCalendarChevron';
import { findMonthIndex } from './monthHasDepartures';

interface TourDepartureCalendarNavProps {
  displayMonth: Date;
  monthsWithDepartures: Date[];
  onMonthChange: (month: Date) => void;
}

const TourDepartureCalendarNav = ({
  displayMonth,
  monthsWithDepartures,
  onMonthChange,
}: TourDepartureCalendarNavProps) => {
  const currentIndex = findMonthIndex(monthsWithDepartures, displayMonth);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  const canGoPrev = safeIndex > 0;
  const canGoNext = safeIndex < monthsWithDepartures.length - 1;

  const prevMonth = monthsWithDepartures[safeIndex - 1];
  const nextMonth = monthsWithDepartures[safeIndex + 1];

  const monthLabel = format(displayMonth, 'LLLL yyyy', { locale: ru });

  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-full border border-divider bg-surface-light/90 text-text-primary transition-colors hover:bg-surface-dark/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={UI.tourDepartureCalendar.prevMonthAria}
        disabled={!canGoPrev || prevMonth == null}
        onClick={() => prevMonth != null && onMonthChange(prevMonth)}
      >
        <TourCalendarChevron orientation="left" />
      </button>

      <p className="font-heading text-base capitalize text-text-primary">{monthLabel}</p>

      <button
        type="button"
        className="inline-flex size-8 items-center justify-center rounded-full border border-divider bg-surface-light/90 text-text-primary transition-colors hover:bg-surface-dark/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={UI.tourDepartureCalendar.nextMonthAria}
        title={canGoNext ? undefined : UI.tourDepartureCalendar.nextMonthDisabledTooltip}
        disabled={!canGoNext || nextMonth == null}
        onClick={() => nextMonth != null && onMonthChange(nextMonth)}
      >
        <TourCalendarChevron orientation="right" />
      </button>
    </div>
  );
};

export default TourDepartureCalendarNav;
