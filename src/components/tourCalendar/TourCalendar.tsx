import { useCallback, useState } from 'react';
import { startOfDay } from 'date-fns';
import type { Season } from '../../types';
import { UI } from '../../constants/ui';
import { useTourScheduleCalendarEvents } from '../../hooks/useTourScheduleCalendarEvents';
import TourCalendarDayPanel from './TourCalendarDayPanel';
import TourCalendarMonth from './TourCalendarMonth';

interface TourCalendarProps {
  season: Season;
}

const TourCalendar = ({ season }: TourCalendarProps) => {
  const { status, events, eventsByDate, retry } = useTourScheduleCalendarEvents();
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => startOfDay(new Date()));

  const handleMonthChange = useCallback((month: Date) => {
    setDisplayMonth(month);
    setSelectedDate(undefined);
  }, []);

  const isLoading = status === 'idle' || status === 'loading';
  const hasError = status === 'error';
  const isEmptyAll = status === 'success' && events.length === 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="order-2 lg:order-1">
        <TourCalendarDayPanel
          selectedDate={selectedDate}
          eventsByDate={eventsByDate}
          isLoading={isLoading}
          hasError={hasError}
          isEmptyAll={isEmptyAll}
          onRetry={retry}
        />
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
            onSelectDate={setSelectedDate}
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
