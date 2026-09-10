import type { AdminDeparture } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import { ADMIN_UI } from '../constants/ui';
import { formatScheduleDayTitle, formatScheduleDepartureCount } from '../formatAdminCopy';
import AdminDialog from './AdminDialog';
import AdminButton from './AdminButton';
import DepartureStatusMenu from './DepartureStatusMenu';
import TourCoverImage from './TourCoverImage';

type ScheduleDayDeparturesDialogProps = {
  startsOn: string;
  departures: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls: Record<string, string | null>;
  selectedId?: string;
  onSelect: (departure: AdminDeparture) => void;
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
  onAddDeparture?: () => void;
  onClose: () => void;
};

const ScheduleDayDeparturesDialog = ({
  startsOn,
  departures,
  tourTitles,
  tourImageUrls,
  selectedId,
  onSelect,
  onStatusChange,
  onAddDeparture,
  onClose,
}: ScheduleDayDeparturesDialogProps) => (
  <AdminDialog
    title={formatScheduleDayTitle(startsOn)}
    titleId="admin-departure-stack-heading"
    closeLabel={ADMIN_UI.cancel}
    size="lg"
    onClose={onClose}
  >
    <p className="mb-4 text-sm text-text-muted">{formatScheduleDepartureCount(departures.length)}</p>
    <ul className="flex flex-col gap-2">
      {departures.map((departure) => {
        const title = tourTitles[departure.tourId] ?? departure.tourId;
        const cancelled = departure.status === 'cancelled';

        return (
          <li key={departure.id}>
            <div
              role="button"
              tabIndex={0}
              className={`admin-schedule-day-detail-item ${
                departure.id === selectedId ? 'admin-schedule-day-detail-item-selected' : ''
              } ${cancelled ? 'opacity-80' : ''}`}
              aria-label={title}
              onClick={() => onSelect(departure)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(departure);
                }
              }}
            >
              <TourCoverImage
                src={tourImageUrls[departure.tourId]}
                alt=""
                className="h-12 w-16 shrink-0 rounded-admin-control"
              />
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium text-text-primary">{title}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <DepartureStatusMenu
                    departure={departure}
                    onChange={
                      onStatusChange == null
                        ? undefined
                        : (status) => {
                            onStatusChange(departure, status);
                          }
                    }
                  />
                  <span className="text-tooltip text-text-muted">
                    {departure.seats} {ADMIN_UI.dashboardSeats.toLowerCase()}
                  </span>
                </span>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
    {onAddDeparture != null ? (
      <AdminButton type="button" variant="secondary" className="mt-4 w-full" onClick={onAddDeparture}>
        {ADMIN_UI.scheduleAddDeparture}
      </AdminButton>
    ) : null}
  </AdminDialog>
);

export default ScheduleDayDeparturesDialog;
