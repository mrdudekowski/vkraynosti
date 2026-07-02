import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { CascadeGridItemAnimationOptions } from '../../constants/cascadeGridReveal';
import {
  TOUR_CALENDAR_DAY_EVENT_BODY_CLASS,
  TOUR_CALENDAR_DAY_EVENT_FOOTER_CLASS,
  TOUR_CALENDAR_DAY_EVENT_MEDIA_CLASS,
  TOUR_CALENDAR_DAY_EVENT_SKELETON_CLASS,
  TOUR_CALENDAR_DAY_EVENT_TITLE_CLASS,
  TOUR_CALENDAR_DAY_EVENTS_GRID_CLASS,
  TOUR_CALENDAR_DAY_EVENTS_GRID_ITEM_CLASS,
  TOUR_CALENDAR_DAY_HEADING_CLASS,
} from '../../constants/tourCalendarLayout';
import { UI } from '../../constants/ui';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourScheduleListItem from './TourScheduleListItem';

interface TourCalendarDayPanelProps {
  selectedDate: Date | undefined;
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  isLoading: boolean;
  hasError: boolean;
  isEmptyAll: boolean;
  onRetry: () => void;
  contentKey: string | null;
  displayedItems: EnrichedScheduleEvent[];
  displayedKey: string | null;
  getItemAnimation: (
    itemIndex: number,
    options?: CascadeGridItemAnimationOptions,
  ) => { className: string; style?: { transitionDelay: string } };
}

const TourCalendarDayPanel = ({
  selectedDate,
  isLoading,
  hasError,
  isEmptyAll,
  onRetry,
  contentKey,
  displayedItems,
  displayedKey,
  getItemAnimation,
}: TourCalendarDayPanelProps) => {
  const iso = selectedDate ? toIsoDate(selectedDate) : null;
  const headingIso = displayedKey ?? iso;
  const formattedDate =
    headingIso != null
      ? format(parseIsoDate(headingIso), 'EEEE, d MMMM', { locale: ru })
      : null;

  if (isLoading) {
    return (
      <ul
        className={TOUR_CALENDAR_DAY_EVENTS_GRID_CLASS}
        aria-busy="true"
        aria-label={UI.tourCalendar.loadingAria}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} className={TOUR_CALENDAR_DAY_EVENTS_GRID_ITEM_CLASS}>
            <div className={TOUR_CALENDAR_DAY_EVENT_SKELETON_CLASS}>
              <div className={`${TOUR_CALENDAR_DAY_EVENT_MEDIA_CLASS} bg-surface-dark/10`} />
              <div className={TOUR_CALENDAR_DAY_EVENT_BODY_CLASS}>
                <div className={`${TOUR_CALENDAR_DAY_EVENT_TITLE_CLASS} rounded bg-surface-dark/10`} />
                <div className={TOUR_CALENDAR_DAY_EVENT_FOOTER_CLASS}>
                  <div className="h-2.5 w-2/3 rounded bg-surface-dark/10" />
                  <div className="h-2.5 w-1/4 rounded bg-surface-dark/10" />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
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

  const showEmptyDay =
    contentKey != null && displayedItems.length === 0 && displayedKey === contentKey;
  const leadAnimation = getItemAnimation(0, { stretch: false });

  return (
    <div aria-live="polite" aria-label={UI.tourCalendar.dayPanelAriaLabel}>
      {formattedDate != null ? (
        <h3
          className={`${TOUR_CALENDAR_DAY_HEADING_CLASS} ${leadAnimation.className}`}
          style={leadAnimation.style}
        >
          {formattedDate}
        </h3>
      ) : null}
      {showEmptyDay ? (
        <p className="text-text-muted">{UI.tourCalendar.emptyDay}</p>
      ) : (
        <ul className={TOUR_CALENDAR_DAY_EVENTS_GRID_CLASS}>
          {displayedItems.map((event, index) => {
            const animation = getItemAnimation(index + 1);
            return (
              <li
                key={`${event.tourId}-${event.date}-${event.status}`}
                className={`${TOUR_CALENDAR_DAY_EVENTS_GRID_ITEM_CLASS} ${animation.className}`}
                style={animation.style}
              >
                <TourScheduleListItem event={event} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TourCalendarDayPanel;
