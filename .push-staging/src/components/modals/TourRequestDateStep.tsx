import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Season } from '../../types';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { UI } from '../../constants/ui';
import { parseIsoDate } from '../../utils/tourSchedule/parseIsoDate';
import type { TourDepartureCalendarModel } from '../../utils/tourSchedule/buildTourDepartureCalendarModel';
import TourDepartureMonthCalendar from '../tourDeparture/TourDepartureMonthCalendar';

export interface TourRequestDateStepProps {
  season: Season;
  departureCalendar: TourDepartureCalendarModel;
  eventsByDate: ReadonlyMap<string, EnrichedScheduleEvent[]>;
  displayMonth: Date;
  onDisplayMonthChange: (month: Date) => void;
  selectedIso?: string;
  onSelectIso: (iso: string) => void;
  scheduleLoading: boolean;
}

const TourRequestDateStep = ({
  season,
  departureCalendar,
  eventsByDate,
  displayMonth,
  onDisplayMonthChange,
  selectedIso,
  onSelectIso,
  scheduleLoading,
}: TourRequestDateStepProps) => {
  const selectedLiveText =
    selectedIso != null && selectedIso.length > 0
      ? UI.tourRequestModal.selectedDepartureLive(
          format(parseIsoDate(selectedIso), 'd MMMM yyyy', { locale: ru })
        )
      : '';

  return (
  <div className="flex flex-col gap-4">
    <h3 className="font-heading text-xl font-normal text-text-primary">
      {UI.tourRequestModal.dateStepTitle}
    </h3>
    <p className="text-sm text-text-muted">{UI.tourRequestModal.dateStepHint}</p>
    {scheduleLoading ? (
      <div
        className="h-48 animate-pulse rounded-card bg-surface-dark/10"
        aria-busy
        aria-label={UI.tourDetail.departuresLoadingAria}
      />
    ) : (
      <TourDepartureMonthCalendar
        mode="select"
        departureDateSet={departureCalendar.departureDateSet}
        monthsWithDepartures={departureCalendar.monthsWithDepartures}
        displayMonth={displayMonth}
        onDisplayMonthChange={onDisplayMonthChange}
        season={season}
        selectedIso={selectedIso}
        onSelectIso={onSelectIso}
        eventsByDate={eventsByDate}
      />
    )}
    <p className="sr-only" aria-live="polite">
      {selectedLiveText}
    </p>
  </div>
  );
};

export default TourRequestDateStep;
