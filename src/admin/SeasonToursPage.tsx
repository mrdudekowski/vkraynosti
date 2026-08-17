import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { adminListTours, type AdminTourListItem } from './api';
import AdminButton from './components/AdminButton';
import AdminPageHeader from './components/AdminPageHeader';
import CreateTourModal from './components/CreateTourModal';
import TourList from './components/TourList';
import { ADMIN_PATHS, isAdminSeasonParam } from './constants/routes';
import { ADMIN_UI } from './constants/ui';

const SeasonToursPage = () => {
  const { season } = useParams<{ season: string }>();
  const navigate = useNavigate();
  const [tours, setTours] = useState<AdminTourListItem[] | null>(null);
  const [listError, setListError] = useState(false);
  const [creating, setCreating] = useState(false);

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

  if (!isAdminSeasonParam(season)) {
    return <Navigate to={ADMIN_PATHS.tours} replace />;
  }

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

  const seasonTours = tours.filter((tour) => tour.season === season);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <Link
        to={ADMIN_PATHS.tours}
        className="inline-flex min-h-11 w-fit items-center rounded-admin-control px-2 text-sm no-underline admin-nav-item"
      >
        {ADMIN_UI.backToTours}
      </Link>
      <AdminPageHeader
        title={ADMIN_UI.seasons[season]}
        description={ADMIN_UI.seasonToursDescription}
        action={
          <AdminButton type="button" onClick={() => setCreating(true)}>
            {ADMIN_UI.addTour}
          </AdminButton>
        }
      />
      <TourList tours={seasonTours} />
      {creating ? (
        <CreateTourModal
          lockedSeason={season}
          onClose={() => setCreating(false)}
          onCreated={(tourId) => {
            setCreating(false);
            void navigate(ADMIN_PATHS.tour(tourId));
          }}
        />
      ) : null}
    </div>
  );
};

export default SeasonToursPage;
