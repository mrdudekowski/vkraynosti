import type { AdminDeparture, AdminTourListItem } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import ScheduleWeekDayPanel from './ScheduleWeekDayPanel';
import ScheduleWeekDaysColumn from './ScheduleWeekDaysColumn';

type ScheduleWeekSplitLayoutProps = {
  days: readonly string[];
  departures: readonly AdminDeparture[];
  selectedDayIso: string;
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  toursById: Record<string, AdminTourListItem>;
  selectedDepartureId?: string;
  todayIso: string;
  onSelectDay: (iso: string) => void;
  onAddOnDate: (iso: string) => void;
  onOpenDeparture: (departure: AdminDeparture) => void;
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
  onDropChip: (departureId: string, startsOn: string) => void;
  dragEnabled?: boolean;
};

const ScheduleWeekSplitLayout = ({
  days,
  departures,
  selectedDayIso,
  tourTitles,
  tourImageUrls,
  toursById,
  selectedDepartureId,
  todayIso,
  onSelectDay,
  onAddOnDate,
  onOpenDeparture,
  onStatusChange,
  onDropChip,
  dragEnabled = true,
}: ScheduleWeekSplitLayoutProps) => {
  const dayDepartures = departures.filter((departure) => departure.startsOn === selectedDayIso);

  return (
    <div className="admin-schedule-week-split mt-3">
      <div className="admin-schedule-week-split-days">
        <ScheduleWeekDaysColumn
          days={days}
          departures={departures}
          tourTitles={tourTitles}
          tourImageUrls={tourImageUrls}
          toursById={toursById}
          selectedDayIso={selectedDayIso}
          selectedDepartureId={selectedDepartureId}
          density="compact"
          todayIso={todayIso}
          onSelectDay={onSelectDay}
          onAddOnDate={onAddOnDate}
          onOpenDeparture={onOpenDeparture}
          onStatusChange={onStatusChange}
          onDropChip={onDropChip}
          dragEnabled={dragEnabled}
        />
      </div>
      <ScheduleWeekDayPanel
        iso={selectedDayIso}
        departures={dayDepartures}
        tourTitles={tourTitles}
        tourImageUrls={tourImageUrls}
        toursById={toursById}
        selectedDepartureId={selectedDepartureId}
        onAdd={() => onAddOnDate(selectedDayIso)}
        onOpenDeparture={onOpenDeparture}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default ScheduleWeekSplitLayout;
