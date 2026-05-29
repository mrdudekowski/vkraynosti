import { useMemo } from 'react';
import { DayPicker, type CustomComponents, type DayButtonProps } from 'react-day-picker';
import { ru } from 'date-fns/locale';
import type { Season } from '../../types';
import type { EnrichedScheduleEvent, TourDepartureCalendarMode } from '../../types/tourSchedule';
import { UI } from '../../constants/ui';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourDepartureCalendarNav from './TourDepartureCalendarNav';
import TourDepartureDayButton from './TourDepartureDayButton';
import { monthHasDepartures } from './monthHasDepartures';
import {
  tourDepartureCalendarClassNames,
  tourDepartureModifierClassNames,
} from './tourDepartureCalendarClassNames';

export interface TourDepartureMonthCalendarProps {
  mode: TourDepartureCalendarMode;
  departureDateSet: ReadonlySet<string>;
  monthsWithDepartures: Date[];
  displayMonth: Date;
  onDisplayMonthChange: (month: Date) => void;
  season: Season;
  selectedIso?: string;
  onSelectIso?: (iso: string) => void;
  /** События тура по ISO (точки под цифрой дня выезда). */
  eventsByDate?: ReadonlyMap<string, EnrichedScheduleEvent[]>;
  className?: string;
}

const TourDepartureMonthCalendar = ({
  mode,
  departureDateSet,
  monthsWithDepartures,
  displayMonth,
  onDisplayMonthChange,
  season,
  selectedIso,
  onSelectIso,
  eventsByDate,
  className = '',
}: TourDepartureMonthCalendarProps) => {
  const selectedDate =
    selectedIso != null && selectedIso.length > 0
      ? parseIsoDate(selectedIso)
      : undefined;

  const hasDeparturesInMonth = monthHasDepartures(displayMonth, departureDateSet);

  const modifiers = useMemo(
    () => ({
      hasDeparture: (date: Date) => departureDateSet.has(toIsoDate(date)),
    }),
    [departureDateSet]
  );

  const disabledDays = useMemo(() => {
    if (mode !== 'select') return undefined;
    return (date: Date) => !departureDateSet.has(toIsoDate(date));
  }, [mode, departureDateSet]);

  const components = useMemo(
    (): Partial<CustomComponents> => ({
      DayButton: (props: DayButtonProps) => (
        <TourDepartureDayButton
          {...props}
          mode={mode}
          departureDateSet={departureDateSet}
          eventsByDate={eventsByDate}
        />
      ),
      Nav: () => <></>,
      MonthCaption: () => <></>,
    }),
    [mode, departureDateSet, eventsByDate]
  );

  const handleSelect = (date: Date | undefined) => {
    if (mode !== 'select' || date == null || onSelectIso == null) return;
    const iso = toIsoDate(date);
    if (!departureDateSet.has(iso)) return;
    onSelectIso(iso);
  };

  const rootClass = [
    'tour-departure-calendar-root',
    mode === 'display' ? 'tour-departure-calendar--display' : 'tour-departure-calendar--select',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      data-season={season}
      role="group"
      aria-label={UI.tourDepartureCalendar.calendarAriaLabel}
    >
      {monthsWithDepartures.length > 0 && (
        <TourDepartureCalendarNav
          displayMonth={displayMonth}
          monthsWithDepartures={monthsWithDepartures}
          onMonthChange={onDisplayMonthChange}
        />
      )}

      {!hasDeparturesInMonth && departureDateSet.size > 0 && (
        <p className="mb-2 text-center text-tooltip text-text-muted">
          {UI.tourDepartureCalendar.emptyMonth}
        </p>
      )}

      <DayPicker
        mode="single"
        selected={mode === 'select' ? selectedDate : undefined}
        onSelect={mode === 'select' ? handleSelect : undefined}
        month={displayMonth}
        onMonthChange={onDisplayMonthChange}
        locale={ru}
        weekStartsOn={1}
        showOutsideDays
        fixedWeeks={false}
        disabled={disabledDays}
        modifiers={modifiers}
        modifiersClassNames={tourDepartureModifierClassNames}
        classNames={tourDepartureCalendarClassNames}
        components={components}
      />
    </div>
  );
};

export default TourDepartureMonthCalendar;
