import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS } from '../../constants/tourCalendarLayout';
import { UI } from '../../constants/ui';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourScheduleListItem from './TourScheduleListItem';

interface TourCalendarDayPanelProps {
  selectedDate: Date | undefined;
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  isLoading: boolean;
  hasError: boolean;
  isEmptyAll: boolean;
  onRetry: () => void;
}

const TourCalendarDayPanel = ({
  selectedDate,
  eventsByDate,
  isLoading,
  hasError,
  isEmptyAll,
  onRetry,
}: TourCalendarDayPanelProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label={UI.tourCalendar.loadingAria}>
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-card bg-surface-light/60"
          />
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="rounded-card border border-divider bg-surface-light/90 p-6 text-center">
        <p className="text-text-muted">{UI.tourCalendar.emptyAll}</p>
        <button type="button" className="btn-ghost mt-4" onClick={onRetry}>
          {UI.tourCalendar.retryLoad}
        </button>
      </div>
    );
  }

  if (isEmptyAll) {
    return (
      <div className="rounded-card border border-divider bg-surface-light/90 p-6 text-center">
        <p className="text-text-muted">{UI.tourCalendar.emptyAll}</p>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className={TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS} aria-live="polite">
        <p className="max-w-xs text-text-muted">{UI.tourCalendar.selectDateHint}</p>
      </div>
    );
  }

  const iso = toIsoDate(selectedDate);
  const dayEvents = eventsByDate.get(iso) ?? [];
  const formattedDate = format(selectedDate, 'EEEE, d MMMM', { locale: ru });

  return (
    <div aria-live="polite" aria-label={UI.tourCalendar.dayPanelAriaLabel}>
      <h3 className="mb-4 font-heading text-lg capitalize text-text-primary">{formattedDate}</h3>
      {dayEvents.length === 0 ? (
        <p className="text-text-muted">{UI.tourCalendar.emptyDay}</p>
      ) : (
        <ul className="space-y-3">
          {dayEvents.map(event => (
            <li key={`${event.tourId}-${event.date}-${event.status}`}>
              <TourScheduleListItem event={event} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TourCalendarDayPanel;
