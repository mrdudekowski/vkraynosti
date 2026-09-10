import { useCallback, useMemo, useState } from 'react';
import { startOfMonth } from 'date-fns';
import type { Season } from '../../types';
import {
  TOUR_CALENDAR_SELECT_DATE_HINT_HOST_CLASS,
  TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS,
} from '../../constants/tourCalendarLayout';
import { UI } from '../../constants/ui';
import { useCascadeGridReveal } from '../../hooks/useCascadeGridReveal';
import { useTourScheduleCalendarEvents } from '../../hooks/useTourScheduleCalendarEvents';
import { findNearestCalendarDepartureDate } from '../../utils/tourSchedule/findNearestCalendarDepartureDate';
import { toIsoDate } from '../../utils/tourSchedule/toIsoDate';
import TourCalendarDayPanel from './TourCalendarDayPanel';
import TourCalendarMonth from './TourCalendarMonth';

const SELECT_DATE_CONTENT_KEY = '__select__';

interface TourCalendarProps {
  season: Season;
}

const TourCalendar = ({ season }: TourCalendarProps) => {
  const { status, events, eventsByDate, retry } = useTourScheduleCalendarEvents();
  const nearestDate = useMemo(
    () => findNearestCalendarDepartureDate(events),
    [events],
  );
  const [monthOverride, setMonthOverride] = useState<Date | undefined>(undefined);
  const [selection, setSelection] = useState<'auto' | Date | undefined>('auto');

  const selectedDate = selection === 'auto' ? nearestDate : selection;
  const displayMonth = monthOverride ?? startOfMonth(nearestDate ?? new Date());

  const handleMonthChange = useCallback((month: Date) => {
    setMonthOverride(month);
    setSelection(undefined);
  }, []);

  const isLoading = status === 'idle' || status === 'loading';
  const hasError = status === 'error';
  const isEmptyAll = status === 'success' && events.length === 0;
  const scheduleReady = !isLoading && !hasError && !isEmptyAll;

  const iso = selectedDate ? toIsoDate(selectedDate) : null;
  const dayEvents = iso ? (eventsByDate.get(iso) ?? []) : [];
  const contentKey = scheduleReady ? (iso ?? SELECT_DATE_CONTENT_KEY) : null;
  const { displayedItems, displayedKey, getItemAnimation } = useCascadeGridReveal(
    dayEvents,
    contentKey,
    1,
  );
  const panelKey = displayedKey ?? contentKey;
  const isSelectMode = panelKey === SELECT_DATE_CONTENT_KEY;
  const selectHintAnimation = getItemAnimation(0, { stretch: false });

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="order-2 lg:order-1">
        {isSelectMode && scheduleReady ? (
          <div className={TOUR_CALENDAR_SELECT_DATE_HINT_HOST_CLASS} aria-live="polite">
            <div
              className={`${TOUR_CALENDAR_SELECT_DATE_PANEL_CLASS} ${selectHintAnimation.className}`}
              style={selectHintAnimation.style}
            >
              <p aria-label={UI.tourCalendar.selectDateHint}>
                <span className="block">{UI.tourCalendar.selectDateHintLine1}</span>
                <span className="block">{UI.tourCalendar.selectDateHintLine2}</span>
              </p>
            </div>
          </div>
        ) : !isSelectMode ? (
          <TourCalendarDayPanel
            selectedDate={selectedDate}
            eventsByDate={eventsByDate}
            isLoading={isLoading}
            hasError={hasError}
            isEmptyAll={isEmptyAll}
            onRetry={retry}
            contentKey={contentKey}
            displayedItems={displayedItems}
            displayedKey={displayedKey}
            getItemAnimation={getItemAnimation}
          />
        ) : null}
      </div>
      <div className="order-1 min-w-0 lg:order-2">
        {!isLoading && !hasError && !isEmptyAll && (
          <TourCalendarMonth
            season={season}
            events={events}
            eventsByDate={eventsByDate}
            displayMonth={displayMonth}
            selectedDate={selectedDate}
            onDisplayMonthChange={handleMonthChange}
            onSelectDate={setSelection}
          />
        )}
        {isLoading && (
          <div
            className="rounded-card border border-divider bg-surface-light/90 p-6 shadow-md"
            aria-busy="true"
            aria-label={UI.tourCalendar.loadingAria}
          >
            <div className="mb-4 h-8 animate-pulse rounded bg-surface-dark/10" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, index) => (
                <div key={index} className="aspect-square animate-pulse rounded-lg bg-surface-dark/10" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourCalendar;
