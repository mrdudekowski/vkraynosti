import { CalendarOff, Plus } from 'lucide-react';
import type { AdminDeparture, AdminTourListItem } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import { ADMIN_UI } from '../constants/ui';
import {
  formatScheduleDepartureCount,
  formatScheduleSeatsTotal,
  formatScheduleWeekdayDate,
} from '../formatAdminCopy';
import AdminEmptyState from './AdminEmptyState';
import ScheduleWeekDepartureRow from './ScheduleWeekDepartureRow';
import AdminIcon from './AdminIcon';

type ScheduleWeekDayPanelProps = {
  iso: string;
  departures: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  toursById: Record<string, AdminTourListItem>;
  selectedDepartureId?: string;
  onAdd: () => void;
  onOpenDeparture: (departure: AdminDeparture) => void;
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
};

const ScheduleWeekDayPanel = ({
  iso,
  departures,
  tourTitles,
  tourImageUrls,
  toursById,
  selectedDepartureId,
  onAdd,
  onOpenDeparture,
  onStatusChange,
}: ScheduleWeekDayPanelProps) => {
  const seatsTotal = departures.reduce((sum, departure) => sum + departure.seats, 0);

  return (
    <section
      className="admin-schedule-week-panel overflow-y-auto overscroll-y-contain"
      aria-labelledby="admin-week-day-panel-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="admin-week-day-panel-heading"
            className="text-admin-section text-text-primary"
          >
            {formatScheduleWeekdayDate(iso)}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {formatScheduleDepartureCount(departures.length)}
            {departures.length > 0 ? ` · ${formatScheduleSeatsTotal(seatsTotal)}` : ''}
          </p>
        </div>
        <button type="button" className="admin-schedule-context-add" aria-label={`${ADMIN_UI.scheduleAddOnDate} ${iso}`} onClick={onAdd}>
          <AdminIcon icon={Plus} size={18} />
        </button>
      </div>
      {departures.length === 0 ? (
        <div className="mt-4">
          <AdminEmptyState
            title={ADMIN_UI.scheduleDayEmpty}
            icon={CalendarOff}
          />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {departures.map((departure) => (
            <li key={departure.id}>
              <ScheduleWeekDepartureRow
                departure={departure}
                title={tourTitles[departure.tourId] ?? departure.tourId}
                imageUrl={tourImageUrls[departure.tourId]}
                tour={toursById[departure.tourId]}
                selected={departure.id === selectedDepartureId}
                variant="detail"
                seatsLabel={`${departure.seats} ${ADMIN_UI.dashboardSeats.toLowerCase()}`}
                onOpen={() => onOpenDeparture(departure)}
                onStatusChange={
                  onStatusChange == null
                    ? undefined
                    : (status) => {
                        onStatusChange(departure, status);
                      }
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ScheduleWeekDayPanel;
