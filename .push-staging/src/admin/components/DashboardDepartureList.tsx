import { CalendarClock, MapPinned, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AdminDeparture } from '../api';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import type { DepartureQuickStatus } from '../departureQuickStatus';
import {
  DASHBOARD_DAY_VISIBLE_DEPARTURES,
  groupDeparturesByStartsOn,
  splitDayDepartures,
} from '../scheduleDayDepartures';
import AdminEmptyState from './AdminEmptyState';
import AdminIcon from './AdminIcon';
import ScheduleDayDeparturesDialog from './ScheduleDayDeparturesDialog';
import ScheduleDepartureCoverCard from './ScheduleDepartureCoverCard';
import ScheduleOverflowAvatars from './ScheduleOverflowAvatars';

type DashboardDepartureListProps = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  actionLabel: string;
  actionTo: string;
  departures: readonly AdminDeparture[];
  tourTitles: Record<string, string>;
  tourImageUrls?: Record<string, string | null>;
  todayIso?: string;
  variant?: 'current' | 'upcoming';
  onStatusChange?: (departure: AdminDeparture, status: DepartureQuickStatus) => void;
};

function formatDashboardDepartureDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatRelativeDepartureDate(startsOn: string, todayIso?: string): string | null {
  if (todayIso == null) {
    return null;
  }

  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const departureTime = Date.parse(`${startsOn}T00:00:00Z`);
  const todayTime = Date.parse(`${todayIso}T00:00:00Z`);
  const daysUntilDeparture = Math.round((departureTime - todayTime) / dayMilliseconds);

  if (daysUntilDeparture === 0) {
    return ADMIN_UI.dashboardRelativeToday;
  }
  if (daysUntilDeparture === 1) {
    return ADMIN_UI.dashboardRelativeTomorrow;
  }
  if (daysUntilDeparture > 1) {
    return `${ADMIN_UI.dashboardRelativeDaysPrefix} ${daysUntilDeparture} ${ADMIN_UI.dashboardRelativeDaysSuffix}`;
  }

  return null;
}

const DashboardDepartureList = ({
  title,
  emptyTitle,
  emptyDescription,
  actionLabel,
  actionTo,
  departures,
  tourTitles,
  tourImageUrls = {},
  todayIso,
  variant = 'upcoming',
  onStatusChange,
}: DashboardDepartureListProps) => {
  const icon = variant === 'current' ? MapPinned : CalendarClock;
  const navigate = useNavigate();
  const [stackIso, setStackIso] = useState<string | null>(null);
  const groups = groupDeparturesByStartsOn(departures);
  const stacked = stackIso == null ? [] : departures.filter((departure) => departure.startsOn === stackIso);

  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <AdminIcon icon={icon} className="text-text-muted" />
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      </div>
      {departures.length === 0 ? (
        <AdminEmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={icon}
          action={
            <Link to={actionTo} className="admin-btn-ghost no-underline">
              {actionLabel}
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-divider border-y border-divider">
          {groups.map((group) => {
            const { visible, overflow } = splitDayDepartures(group.items, DASHBOARD_DAY_VISIBLE_DEPARTURES);
            const relativeDate = formatRelativeDepartureDate(group.startsOn, todayIso);
            return (
              <li key={group.startsOn} className="flex flex-col gap-2 px-1 py-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <time dateTime={group.startsOn} className="text-sm font-medium text-text-primary">
                    {formatDashboardDepartureDate(group.startsOn)}
                  </time>
                  {relativeDate != null ? (
                    <span className="text-xs text-text-muted">{relativeDate}</span>
                  ) : null}
                </div>
                {visible.map((departure) => {
                  const tourTitle = tourTitles[departure.tourId] ?? departure.tourId;
                  return (
                    <div key={departure.id}>
                      <ScheduleDepartureCoverCard
                        departure={departure}
                        title={tourTitle}
                        imageUrl={tourImageUrls[departure.tourId]}
                        href={ADMIN_PATHS.scheduleDeparture(departure.id, departure.startsOn)}
                        openLabel={`${tourTitle} ${departure.startsOn}`}
                        onStatusChange={
                          onStatusChange == null
                            ? undefined
                            : (status) => {
                                onStatusChange(departure, status);
                              }
                        }
                        meta={
                          <span className="mt-1 flex items-center gap-1 text-tooltip text-text-muted">
                            <AdminIcon icon={Users} size={16} />
                            {`${ADMIN_UI.dashboardSeats}: ${departure.seats}`}
                          </span>
                        }
                      />
                    </div>
                  );
                })}
                <ScheduleOverflowAvatars
                  overflow={overflow}
                  tourTitles={tourTitles}
                  tourImageUrls={tourImageUrls}
                  onOpen={() => setStackIso(group.startsOn)}
                />
              </li>
            );
          })}
        </ul>
      )}
      {stackIso != null ? (
        <ScheduleDayDeparturesDialog
          startsOn={stackIso}
          departures={stacked}
          tourTitles={tourTitles}
          tourImageUrls={tourImageUrls}
          onSelect={(departure) => {
            setStackIso(null);
            void navigate(ADMIN_PATHS.scheduleDeparture(departure.id, departure.startsOn));
          }}
          onStatusChange={onStatusChange}
          onClose={() => setStackIso(null)}
        />
      ) : null}
    </section>
  );
};

export default DashboardDepartureList;
