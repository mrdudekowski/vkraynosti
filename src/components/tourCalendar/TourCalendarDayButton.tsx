import type { DayButtonProps } from 'react-day-picker';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { buildDayAriaLabel } from '../../utils/tourSchedule/buildDayAriaLabel';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourCalendarDayEventDots from './TourCalendarDayEventDots';

interface TourCalendarDayButtonProps extends DayButtonProps {
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  readOnly?: boolean;
}

const TourCalendarDayButton = ({
  day,
  modifiers,
  eventsByDate,
  readOnly = false,
  className,
  ...buttonProps
}: TourCalendarDayButtonProps) => {
  const iso = toIsoDate(day.date);
  const events = eventsByDate.get(iso) ?? [];
  const ariaLabel = buildDayAriaLabel(day.date, events.length);

  return (
    <button
      type="button"
      {...buttonProps}
      tabIndex={readOnly ? -1 : buttonProps.tabIndex}
      aria-label={ariaLabel}
      aria-selected={modifiers.selected || undefined}
      className={className}
    >
      <span>{day.date.getDate()}</span>
      {events.length > 0 && <TourCalendarDayEventDots events={events} />}
    </button>
  );
};

export default TourCalendarDayButton;
