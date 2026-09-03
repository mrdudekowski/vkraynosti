import { Plus } from 'lucide-react';
import type { AdminDeparture, AdminTourListItem } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import { ADMIN_UI } from '../constants/ui';
import { formatScheduleAgendaDayLabel, formatScheduleDepartureCount } from '../formatAdminCopy';
import AdminIcon from './AdminIcon';
import ScheduleWeekDepartureRow from './ScheduleWeekDepartureRow';

type ScheduleWeekDaysColumnProps = {
  days: readonly string[];
  departures: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  toursById: Record<string, AdminTourListItem>;
  selectedDayIso: string | null;
  selectedDepartureId?: string;
  density: 'comfortable' | 'compact';
  todayIso: string;
  onSelectDay: (iso: string) => void;
  onAddOnDate: (iso: string) => void;
  onOpenDeparture: (departure: AdminDeparture) => void;
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
  onDropChip: (departureId: string, startsOn: string) => void;
  dragEnabled?: boolean;
};

const ScheduleWeekDaysColumn = ({
  days,
  departures,
  tourTitles,
  tourImageUrls,
  toursById,
  selectedDayIso,
  selectedDepartureId,
  density,
  todayIso,
  onSelectDay,
  onAddOnDate,
  onOpenDeparture,
  onStatusChange,
  onDropChip,
  dragEnabled = true,
}: ScheduleWeekDaysColumnProps) => (
  <div className="flex min-w-0 flex-col">
    {days.map((iso) => {
      const items = departures.filter((departure) => departure.startsOn === iso);
      const selected = iso === selectedDayIso;
      const isToday = iso === todayIso;
      return (
        <section
          key={iso}
          className={`admin-schedule-week-section ${selected ? 'admin-schedule-week-section-selected' : ''} ${
            isToday ? 'admin-schedule-week-section-today' : ''
          }`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const departureId = event.dataTransfer.getData('text/plain');
            if (departureId.length > 0) {
              onDropChip(departureId, iso);
            }
          }}
        >
          <div className="admin-schedule-week-section-header">
            <button
              type="button"
              className="admin-schedule-week-day-button"
              aria-pressed={selected}
              aria-label={`${ADMIN_UI.scheduleSelectDay} ${iso}`}
              onClick={() => onSelectDay(iso)}
            >
              <span className="font-medium text-text-primary">{formatScheduleAgendaDayLabel(iso)}</span>
              {density === 'compact' || items.length > 0 ? (
                <span className="text-tooltip text-text-muted">
                  {formatScheduleDepartureCount(items.length)}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="admin-schedule-week-day-add"
              aria-label={`${ADMIN_UI.scheduleAddOnDate} ${iso}`}
              onClick={() => onAddOnDate(iso)}
            >
              <AdminIcon icon={Plus} size={16} />
            </button>
          </div>
          {items.map((departure) => (
            <ScheduleWeekDepartureRow
              key={departure.id}
              departure={departure}
              title={tourTitles[departure.tourId] ?? departure.tourId}
              imageUrl={tourImageUrls[departure.tourId]}
              tour={toursById[departure.tourId]}
              selected={departure.id === selectedDepartureId}
              variant={density === 'compact' ? 'compact' : 'row'}
              onOpen={() => onOpenDeparture(departure)}
              onStatusChange={
                onStatusChange == null
                  ? undefined
                  : (status) => {
                      onStatusChange(departure, status);
                    }
              }
              dragEnabled={dragEnabled}
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', departure.id);
              }}
            />
          ))}
        </section>
      );
    })}
  </div>
);

export default ScheduleWeekDaysColumn;
