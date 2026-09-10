import type { AdminDeparture } from '../api';
import { Plus } from 'lucide-react';
import { ADMIN_UI } from '../constants/ui';
import { splitDayDepartures } from '../scheduleDayDepartures';
import AdminIcon from './AdminIcon';
import ScheduleMonthDepartureItem from './ScheduleMonthDepartureItem';
import ScheduleOverflowLink from './ScheduleOverflowLink';

type ScheduleMonthGridProps = {
  visibleDays: readonly string[];
  cursorIso: string;
  todayIso: string;
  departures: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  selectedDepartureId?: string;
  selectedDayIso?: string | null;
  visibleDepartureCount: number;
  onCellActivate: (iso: string) => void;
  onQuickAdd: (iso: string) => void;
  onOpenDeparture: (departure: AdminDeparture, iso: string, totalOnDay: number) => void;
  onOpenDayDetail: (iso: string) => void;
  onDropChip: (departureId: string, startsOn: string) => void;
};

const ScheduleMonthGrid = ({
  visibleDays,
  cursorIso,
  todayIso,
  departures,
  tourTitles,
  tourImageUrls,
  selectedDepartureId,
  selectedDayIso,
  visibleDepartureCount,
  onCellActivate,
  onQuickAdd,
  onOpenDeparture,
  onOpenDayDetail,
  onDropChip,
}: ScheduleMonthGridProps) => (
  <div className="admin-schedule-month">
    <div className="admin-schedule-weekdays" aria-hidden="true">
      {ADMIN_UI.scheduleWeekdays.map((label) => (
        <div key={label} className="admin-schedule-weekday">
          {label}
        </div>
      ))}
    </div>
    <div className="admin-schedule-grid">
      {visibleDays.map((iso) => {
        const chips = departures.filter((departure) => departure.startsOn === iso);
        const { visible, overflow } = splitDayDepartures(chips, visibleDepartureCount);
        const inMonth = iso.slice(0, 7) === cursorIso.slice(0, 7);
        const isToday = iso === todayIso;
        const isSelected = selectedDayIso === iso || selectedDepartureId != null && chips.some((item) => item.id === selectedDepartureId);
        const showQuickAdd = chips.length > 0 || isSelected;

        return (
          <div
            key={iso}
            className={`admin-schedule-day group ${inMonth ? '' : 'admin-schedule-day-outside'} ${
              isToday ? 'admin-schedule-day-today' : ''
            } ${isSelected ? 'admin-schedule-day-selected' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const departureId = event.dataTransfer.getData('text/plain');
              if (departureId.length > 0) {
                onDropChip(departureId, iso);
              }
            }}
          >
            <div className="admin-schedule-day-header">
              <button
                type="button"
                className={`admin-schedule-day-number ${inMonth ? '' : 'admin-schedule-day-number-outside'}`}
                aria-label={`${ADMIN_UI.scheduleEmptyCell} ${iso}`}
                onClick={() => onCellActivate(iso)}
              >
                {iso.slice(8)}
              </button>
              <button
                type="button"
                className={`admin-schedule-day-add ${showQuickAdd ? 'admin-schedule-day-add-visible' : ''}`}
                aria-label={`${ADMIN_UI.scheduleAddOnDate} ${iso}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onQuickAdd(iso);
                }}
              >
                <AdminIcon icon={Plus} size={16} />
              </button>
            </div>
            <div className="admin-schedule-day-items">
              {visible.map((departure) => (
                <div
                  key={departure.id}
                  draggable={departure.status !== 'completed'}
                  className={departure.status !== 'completed' ? 'admin-schedule-draggable' : undefined}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', departure.id);
                  }}
                >
                  <ScheduleMonthDepartureItem
                    departure={departure}
                    title={tourTitles[departure.tourId] ?? departure.tourId}
                    imageUrl={tourImageUrls[departure.tourId]}
                    selected={departure.id === selectedDepartureId}
                    onOpen={() => onOpenDeparture(departure, iso, chips.length)}
                  />
                </div>
              ))}
              <ScheduleOverflowLink
                overflowCount={overflow.length}
                onOpen={() => onOpenDayDetail(iso)}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ScheduleMonthGrid;
