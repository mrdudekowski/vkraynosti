import { addMonths, format, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { UI } from '../../constants/ui';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { monthHasEvents } from '../../utils/tourSchedule/monthHasEvents';
import TourCalendarChevron from './TourCalendarChevron';

interface TourCalendarNavProps {
  displayMonth: Date;
  events: EnrichedScheduleEvent[];
  onMonthChange: (month: Date) => void;
}

const TourCalendarNav = ({ displayMonth, events, onMonthChange }: TourCalendarNavProps) => {
  const today = new Date();
  const minMonth = subMonths(today, 12);
  const prevMonth = subMonths(displayMonth, 1);
  const nextMonth = addMonths(displayMonth, 1);

  const canGoPrev =
    prevMonth.getFullYear() > minMonth.getFullYear() ||
    (prevMonth.getFullYear() === minMonth.getFullYear() &&
      prevMonth.getMonth() >= minMonth.getMonth());

  const canGoNext = monthHasEvents(nextMonth.getFullYear(), nextMonth.getMonth(), events);

  const monthLabel = format(displayMonth, 'LLLL yyyy', { locale: ru });

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full border border-divider bg-surface-light/90 text-text-primary transition-colors hover:bg-surface-dark/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={UI.tourCalendar.prevMonthAria}
        disabled={!canGoPrev}
        onClick={() => onMonthChange(prevMonth)}
      >
        <TourCalendarChevron orientation="left" />
      </button>

      <p className="font-heading text-lg capitalize text-text-primary">{monthLabel}</p>

      <button
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-full border border-divider bg-surface-light/90 text-text-primary transition-colors hover:bg-surface-dark/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={UI.tourCalendar.nextMonthAria}
        title={canGoNext ? undefined : UI.tourCalendar.nextMonthDisabledTooltip}
        disabled={!canGoNext}
        onClick={() => onMonthChange(nextMonth)}
      >
        <TourCalendarChevron orientation="right" />
      </button>
    </div>
  );
};

export default TourCalendarNav;
