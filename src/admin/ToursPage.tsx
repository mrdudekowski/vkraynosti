import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEASON_ORDER } from '../constants/seasonNavbarAppearance';
import { adminListTours, type AdminTourListItem } from './api';
import AdminSeasonCard from './components/AdminSeasonCard';
import { ADMIN_PATHS } from './constants/routes';
import { ADMIN_UI } from './constants/ui';

const ToursPage = () => {
  const [tours, setTours] = useState<AdminTourListItem[] | null>(null);
  const [listError, setListError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void adminListTours()
      .then((items) => {
        if (!cancelled) {
          setTours(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setListError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (listError) {
    return <p className="p-6 text-sm text-difficulty-hard-fg">{ADMIN_UI.loadError}</p>;
  }
  if (tours == null) {
    return (
      <p className="p-6 text-sm text-text-muted" role="status">
        {ADMIN_UI.loading}
      </p>
    );
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold text-text-primary">{ADMIN_UI.listTitle}</h1>
      <p className="text-sm text-text-muted">{ADMIN_UI.listDescription}</p>
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        {SEASON_ORDER.map((season) => (
          <AdminSeasonCard
            key={season}
            season={season}
            tourCount={tours.filter((tour) => tour.season === season).length}
          />
        ))}
      </div>
      <Link
        to={ADMIN_PATHS.individual}
        className="admin-btn-secondary inline-flex min-h-11 items-center justify-center no-underline"
      >
        {ADMIN_UI.individualTours}
      </Link>
    </div>
  );
};

export default ToursPage;
