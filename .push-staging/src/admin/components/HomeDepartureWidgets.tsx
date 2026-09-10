import { CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdminDeparture } from '../api';
import { currentDepartures, nearestDepartureDays } from '../../cms/homeDepartures';
import AdminEmptyState from './AdminEmptyState';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';

type HomeDepartureWidgetsProps = {
  departures: AdminDeparture[];
  titles: Record<string, string>;
  todayIso: string;
  now?: Date;
};

function departureLabel(departure: AdminDeparture, titles: Record<string, string>): string {
  const title = titles[departure.tourId] ?? departure.tourId;
  return `${title} ${departure.startsOn}`;
}

const DepartureLink = ({
  departure,
  titles,
}: {
  departure: AdminDeparture;
  titles: Record<string, string>;
}) => (
  <Link
    to={ADMIN_PATHS.scheduleDeparture(departure.id, departure.startsOn)}
    className={`block min-h-11 rounded-admin-control px-2 py-2 text-sm no-underline text-text-primary admin-nav-item ${
      departure.status === 'cancelled' ? 'line-through text-text-muted' : ''
    }`}
  >
    {departureLabel(departure, titles)}
  </Link>
);

const HomeDepartureWidgets = ({
  departures,
  titles,
  todayIso,
  now = new Date(),
}: HomeDepartureWidgetsProps) => {
  const nearestDays = nearestDepartureDays(departures, todayIso);
  const nearestItems = nearestDays.flatMap((day) =>
    departures.filter((departure) => departure.startsOn === day && departure.status !== 'completed'),
  );
  const currentItems = currentDepartures(departures, now);

  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">{ADMIN_UI.homeNearest}</h2>
        {nearestItems.length === 0 ? (
          <AdminEmptyState title={ADMIN_UI.homeNearestEmpty} icon={CalendarDays} />
        ) : (
          <ul className="flex flex-col">
            {nearestItems.map((departure) => (
              <li key={departure.id}>
                <DepartureLink departure={departure} titles={titles} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-text-primary">{ADMIN_UI.homeCurrent}</h2>
        {currentItems.length === 0 ? (
          <AdminEmptyState title={ADMIN_UI.homeCurrentEmpty} icon={MapPin} />
        ) : (
          <ul className="flex flex-col">
            {currentItems.map((departure) => (
              <li key={departure.id}>
                <DepartureLink departure={departure} titles={titles} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default HomeDepartureWidgets;
