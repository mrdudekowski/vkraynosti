import type { MouseEvent } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { DayButtonProps } from 'react-day-picker';
import type { TourDepartureCalendarMode } from '../../types/tourSchedule';
import { UI } from '../../constants/ui';
import { dateHasDeparture } from './monthHasDepartures';
import { TOUR_DEPARTURE_DAY_DEPARTURE_CLASS } from '../../constants/tourDepartureCalendar';
import {
  TOUR_CALENDAR_DAY_NUMBER_CLASS,
  TOUR_CALENDAR_DAY_SELECTED_CLASS,
} from '../../constants/tourCalendarShared';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourCalendarDayEventDots from '../tourCalendar/TourCalendarDayEventDots';

interface TourDepartureDayButtonProps extends DayButtonProps {
  mode: TourDepartureCalendarMode;
  departureDateSet: ReadonlySet<string>;
  eventsByDate?: ReadonlyMap<string, EnrichedScheduleEvent[]>;
}

const TourDepartureDayButton = ({
  day,
  modifiers,
  mode,
  departureDateSet,
  eventsByDate,
  className,
  onClick,
  ...buttonProps
}: TourDepartureDayButtonProps) => {
  const hasDeparture = dateHasDeparture(day.date, departureDateSet);
  const iso = toIsoDate(day.date);
  const dayEvents =
    eventsByDate != null && hasDeparture ? (eventsByDate.get(iso) ?? []) : [];
  const formatted = format(day.date, 'd MMMM yyyy', { locale: ru });
  const ariaLabel = hasDeparture
    ? UI.tourDepartureCalendar.departureDayAria(formatted)
    : UI.tourDepartureCalendar.nonDepartureDayAria(formatted);

  const mergedClassName = [
    className,
    modifiers.selected ? TOUR_CALENDAR_DAY_SELECTED_CLASS : '',
    hasDeparture ? TOUR_DEPARTURE_DAY_DEPARTURE_CLASS : '',
  ]
    .filter(Boolean)
    .join(' ');

  const dayContent = (
    <>
      <span className={TOUR_CALENDAR_DAY_NUMBER_CLASS}>{day.date.getDate()}</span>
      {dayEvents.length > 0 && <TourCalendarDayEventDots events={dayEvents} />}
    </>
  );

  if (mode === 'display') {
    return (
      <div aria-hidden className={mergedClassName}>
        {dayContent}
      </div>
    );
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!hasDeparture) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type="button"
      {...buttonProps}
      aria-label={ariaLabel}
      aria-disabled={!hasDeparture ? true : undefined}
      className={mergedClassName}
      onClick={handleClick}
    >
      {dayContent}
    </button>
  );
};

export default TourDepartureDayButton;
