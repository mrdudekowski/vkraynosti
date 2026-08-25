import { CalendarOff } from 'lucide-react';
import type { AdminDeparture, AdminTourListItem } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import { ADMIN_UI } from '../constants/ui';
import AdminButton from './AdminButton';
import AdminEmptyState from './AdminEmptyState';
import ScheduleWeekDaysColumn from './ScheduleWeekDaysColumn';

type ScheduleWeekListLayoutProps = {
  days: readonly string[];
  departures: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  toursById: Record<string, AdminTourListItem>;
  selectedDayIso: string | null;
  selectedDepartureId?: string;
  todayIso: string;
  emptyTitle?: string;
  className?: string;
  onSelectDay: (iso: string) => void;
  onAddOnDate: (iso: string) => void;
  onAddWeek: () => void;
  onOpenDeparture: (departure: AdminDeparture) => void;
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
  onDropChip: (departureId: string, startsOn: string) => void;
};

const ScheduleWeekListLayout = ({
  days,
  departures,
  tourTitles,
  tourImageUrls,
  toursById,
  selectedDayIso,
  selectedDepartureId,
  todayIso,
  emptyTitle = ADMIN_UI.scheduleWeekEmpty,
  className = 'admin-schedule-week-list',
  onSelectDay,
  onAddOnDate,
  onAddWeek,
  onOpenDeparture,
  onStatusChange,
  onDropChip,
}: ScheduleWeekListLayoutProps) => (
  <div className={`${className} mt-3 overflow-y-auto overscroll-y-contain`}>
    {departures.length === 0 ? (
      <div className="mb-3">
        <AdminEmptyState
          title={emptyTitle}
          icon={CalendarOff}
          action={
            <AdminButton type="button" onClick={onAddWeek}>
              {ADMIN_UI.scheduleAdd}
            </AdminButton>
          }
        />
      </div>
    ) : null}
    <ScheduleWeekDaysColumn
      days={days}
      departures={departures}
      tourTitles={tourTitles}
      tourImageUrls={tourImageUrls}
      toursById={toursById}
      selectedDayIso={selectedDayIso}
      selectedDepartureId={selectedDepartureId}
      density="comfortable"
      todayIso={todayIso}
      onSelectDay={onSelectDay}
      onAddOnDate={onAddOnDate}
      onOpenDeparture={onOpenDeparture}
      onStatusChange={onStatusChange}
      onDropChip={onDropChip}
    />
  </div>
);

export default ScheduleWeekListLayout;
