import { useMemo } from 'react';
import { DayPicker, type CustomComponents, type DayButtonProps } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { monthHasEvents } from '../../utils/tourSchedule/monthHasEvents';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import { UI } from '../../constants/ui';
import TourCalendarDayButton from './TourCalendarDayButton';
import TourCalendarNav from './TourCalendarNav';
import {
  tourCalendarClassNames,
  tourCalendarModifierClassNames,
} from './tourCalendarClassNames';

interface TourCalendarMonthProps {
  events: EnrichedScheduleEvent[];
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  displayMonth: Date;
  selectedDate: Date | undefined;
  onDisplayMonthChange: (month: Date) => void;
  onSelectDate: (date: Date | undefined) => void;
}

const TourCalendarMonth = ({
  events,
  eventsByDate,
  displayMonth,
  selectedDate,
  onDisplayMonthChange,
  onSelectDate,
}: TourCalendarMonthProps) => {
  const hasEventsInCurrentMonth = monthHasEvents(
    displayMonth.getFullYear(),
    displayMonth.getMonth(),
    events
  );

  const modifiers = useMemo(
    () => ({
      hasEvents: (date: Date) => eventsByDate.has(toIsoDate(date)),
    }),
    [eventsByDate]
  );

  const components = useMemo((): Partial<CustomComponents> => ({
    DayButton: (props: DayButtonProps) => (
      <TourCalendarDayButton {...props} eventsByDate={eventsByDate} />
    ),
    Nav: () => <></>,
    MonthCaption: () => <></>,
  }), [eventsByDate]);

  return (
    <div className="rounded-card border border-divider bg-surface-light/90 p-4 shadow-md backdrop-blur-sm sm:p-6">
      <TourCalendarNav
        displayMonth={displayMonth}
        events={events}
        onMonthChange={onDisplayMonthChange}
      />
      {!hasEventsInCurrentMonth && events.length > 0 && (
        <p className="mb-3 text-center text-sm text-text-muted">{UI.tourCalendar.emptyMonth}</p>
      )}
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        month={displayMonth}
        onMonthChange={onDisplayMonthChange}
        locale={ru}
        weekStartsOn={1}
        showOutsideDays
        fixedWeeks={false}
        modifiers={modifiers}
        modifiersClassNames={tourCalendarModifierClassNames}
        classNames={tourCalendarClassNames}
        components={components}
      />
    </div>
  );
};

export default TourCalendarMonth;
