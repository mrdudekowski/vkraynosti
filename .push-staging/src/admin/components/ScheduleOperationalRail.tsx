import { ChevronRight, FilePenLine, Users } from 'lucide-react';
import type { AdminDeparture, AdminTourListItem } from '../api';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';
import DepartureStatusMenu from './DepartureStatusMenu';
import TourCoverImage from './TourCoverImage';

type ScheduleOperationalRailProps = {
  nearestDepartures: readonly AdminDeparture[];
  toursById: Record<string, AdminTourListItem>;
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
};

function formatRailDepartureDate(startsOn: string): string {
  const [year, month, day] = startsOn.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

const ScheduleOperationalRail = ({
  nearestDepartures,
  toursById,
  onStatusChange,
}: ScheduleOperationalRailProps) => (
  <aside className="admin-schedule-section-rail flex min-w-0 flex-col gap-3">
    <section className="rounded-card border border-divider bg-surface-light p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-primary">{ADMIN_UI.scheduleNearestDepartures}</h2>
        <span className="text-xs text-text-muted">{nearestDepartures.length}</span>
      </div>
      {nearestDepartures.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">{ADMIN_UI.scheduleNearestDeparturesEmpty}</p>
      ) : (
        <ul className="mt-2 divide-y divide-divider">
          {nearestDepartures.map((departure) => {
            const tour = toursById[departure.tourId];
            const title = tour?.title ?? departure.tourId;

            return (
              <li key={departure.id} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <TourCoverImage
                    src={tour?.imageUrl}
                    alt={title}
                    className="h-8 w-10 shrink-0 rounded-admin-control"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-text-primary">{title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-tooltip text-text-muted">
                      <span>{formatRailDepartureDate(departure.startsOn)}</span>
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
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-tooltip text-text-muted">
                    <AdminIcon icon={Users} size={16} />
                    {departure.seats}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" disabled className="admin-btn-ghost mt-3 w-full justify-between">
        {ADMIN_UI.scheduleOpenAllDepartures}
        <AdminIcon icon={ChevronRight} size={16} />
      </button>
    </section>

    <section className="rounded-card border border-divider bg-surface-light p-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-text-primary">{ADMIN_UI.scheduleDraftDepartures}</h2>
        <AdminIcon icon={FilePenLine} size={16} className="text-text-muted" />
      </div>
      <p className="mt-3 text-sm text-text-muted">{ADMIN_UI.scheduleDraftDeparturesEmpty}</p>
    </section>
  </aside>
);

export default ScheduleOperationalRail;
