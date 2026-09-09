import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { adminCalendarSeason } from './adminCalendarSeason';
import {
  adminCloneTour,
  adminDeleteTour,
  type AdminDeparture,
  type AdminTourListItem,
} from './api';
import {
  getAdminDepartures,
  getAdminTours,
  invalidateAdminPublishQueue,
  invalidateAdminTours,
  peekAdminDepartures,
  peekAdminTours,
  refreshAdminDepartures,
  refreshAdminTours,
} from './adminDataCache';
import { applyAdminTourGuestVisibility } from './applyAdminTourGuestVisibility';
import { countToursOnSite } from './adminTourVisibility';
import AdminErrorState from './components/AdminErrorState';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSeasonSwitcher from './components/AdminSeasonSwitcher';
import AdminSkeleton from './components/AdminSkeleton';
import CreateTourModal from './components/CreateTourModal';
import CloneTourModal from './components/CloneTourModal';
import DeleteTourModal from './components/DeleteTourModal';
import TourList from './components/TourList';
import { ADMIN_PATHS, isAdminSeasonParam } from './constants/routes';
import { ADMIN_UI } from './constants/ui';
import { formatAdminOnSiteCount } from './formatAdminCopy';
import { useAdminToast } from './toast/adminToastContext';
import {
  HOME_DEPARTURE_LOOKAHEAD_DAYS,
  HOME_DEPARTURE_LOOKBACK_DAYS,
} from '../cms/homeDepartures';
import { addIsoDays, vladivostokCalendarDate } from './scheduleCalendar';
import type { Season } from '../types';

function nearestByTourId(departures: AdminDeparture[], todayIso: string): Record<string, string> {
  const next: Record<string, string> = {};
  for (const departure of departures) {
    if (departure.status === 'cancelled' || departure.status === 'completed') {
      continue;
    }
    if (departure.startsOn < todayIso) {
      continue;
    }
    const current = next[departure.tourId];
    if (current == null || departure.startsOn < current) {
      next[departure.tourId] = departure.startsOn;
    }
  }
  return next;
}

const SeasonToursPage = () => {
  const { season: seasonParam, tourId } = useParams<{ season?: string; tourId?: string }>();
  const { push } = useAdminToast();
  const navigate = useNavigate();
  const requested = seasonParam ?? tourId;
  const season: Season | undefined = isAdminSeasonParam(requested)
    ? requested
    : requested == null
      ? adminCalendarSeason()
      : undefined;
  const todayIso = useMemo(() => vladivostokCalendarDate(), []);
  const departureRange = useMemo(
    () => ({
      from: addIsoDays(todayIso, -HOME_DEPARTURE_LOOKBACK_DAYS),
      to: addIsoDays(todayIso, HOME_DEPARTURE_LOOKAHEAD_DAYS),
      includeHistory: true,
    }),
    [todayIso],
  );
  const [tours, setTours] = useState<AdminTourListItem[] | null>(() => peekAdminTours() ?? null);
  const [departures, setDepartures] = useState<AdminDeparture[]>(
    () => peekAdminDepartures(departureRange) ?? [],
  );
  const [listError, setListError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cloneTour, setCloneTour] = useState<AdminTourListItem | null>(null);
  const [cloneBusy, setCloneBusy] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);
  const [deleteTour, setDeleteTour] = useState<AdminTourListItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [busyTourId, setBusyTourId] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const toursRequest = reloadToken === 0 ? getAdminTours() : refreshAdminTours();
    const departuresRequest = reloadToken === 0
      ? getAdminDepartures(departureRange)
      : refreshAdminDepartures(departureRange);
    void toursRequest
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
    void departuresRequest
      .then((items) => {
        if (!cancelled) {
          setDepartures(items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDepartures([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [departureRange, reloadToken]);

  if (requested != null && !isAdminSeasonParam(requested)) {
    return <Navigate to={ADMIN_PATHS.tours} replace />;
  }

  if (listError) {
    return (
      <AdminPageFrame variant="wide">
        <AdminErrorState
          title={ADMIN_UI.pageLoadError}
          onRetry={() => {
            setListError(false);
            setTours(null);
            setReloadToken((current) => current + 1);
          }}
        />
      </AdminPageFrame>
    );
  }
  if (tours == null || season == null) {
    return (
      <AdminPageFrame variant="wide">
        <AdminSkeleton variant="cards" count={3} />
      </AdminPageFrame>
    );
  }

  const seasonTours = tours.filter((tour) => tour.season === season);
  const nearest = nearestByTourId(departures, todayIso);
  const onSiteCount = countToursOnSite(seasonTours);

  const changeGuestVisibility = async (tourIdToUpdate: string, status: 'hidden' | 'active') => {
    setBusyTourId(tourIdToUpdate);
    try {
      await applyAdminTourGuestVisibility(tourIdToUpdate, status);
      invalidateAdminTours();
      invalidateAdminPublishQueue();
      setTours(await refreshAdminTours());
      push({
        message: status === 'hidden' ? ADMIN_UI.tourHiddenQueued : ADMIN_UI.tourShownQueued,
      });
    } catch {
      push({ message: ADMIN_UI.tourGuestVisibilityError });
    } finally {
      setBusyTourId(null);
    }
  };

  return (
    <AdminPageFrame variant="wide">
      <Link
        to={ADMIN_PATHS.dashboard}
        className="inline-flex min-h-11 w-fit items-center rounded-admin-control px-2 text-sm no-underline admin-nav-item"
      >
        {ADMIN_UI.dashboardNav}
      </Link>
      <AdminPageHeader
        title={ADMIN_UI.listTitle}
        description={ADMIN_UI.listDescription}
        breadcrumbs={[
          { label: ADMIN_UI.dashboardNav, to: ADMIN_PATHS.dashboard },
          { label: ADMIN_UI.toursNav, to: ADMIN_PATHS.tours },
          { label: ADMIN_UI.seasons[season] },
        ]}
        meta={formatAdminOnSiteCount(onSiteCount.onSite, onSiteCount.total)}
        toolbar={
          <AdminSeasonSwitcher
            value={season}
            onChange={(next) => {
              void navigate(ADMIN_PATHS.season(next));
            }}
          />
        }
      />
      <TourList
        tours={seasonTours}
        nearestByTourId={nearest}
        busyTourId={busyTourId}
        queuesVisibility
        onAddTour={() => setCreating(true)}
        onClone={(tourId) => {
          setCloneTour(tours.find((tour) => tour.id === tourId) ?? null);
          setCloneError(null);
        }}
        onDelete={(tourId) => {
          setDeleteTour(tours.find((tour) => tour.id === tourId) ?? null);
          setDeleteError(null);
        }}
        onChangeGuestVisibility={(id, status) => {
          void changeGuestVisibility(id, status);
        }}
      />
      {cloneTour != null ? (
        <CloneTourModal
          tour={cloneTour}
          busy={cloneBusy}
          error={cloneError}
          onClose={() => {
            if (!cloneBusy) {
              setCloneTour(null);
              setCloneError(null);
            }
          }}
          onSubmit={(targetSeason) => {
            setCloneBusy(true);
            setCloneError(null);
            void adminCloneTour(cloneTour.id, targetSeason)
              .then((result) => {
                invalidateAdminTours();
                invalidateAdminPublishQueue();
                void refreshAdminTours();
                setCloneTour(null);
                void navigate(ADMIN_PATHS.tour(result.document.id));
                push({ message: ADMIN_UI.cloneTourSuccess });
              })
              .catch((caught) => {
                setCloneError(caught instanceof Error ? caught.message : 'clone_failed');
              })
              .finally(() => {
                setCloneBusy(false);
              });
          }}
        />
      ) : null}
      {deleteTour != null ? (
        <DeleteTourModal
          tour={deleteTour}
          busy={deleteBusy}
          error={deleteError}
          onClose={() => {
            if (!deleteBusy) {
              setDeleteTour(null);
              setDeleteError(null);
            }
          }}
          onConfirm={() => {
            setDeleteBusy(true);
            setDeleteError(null);
            void adminDeleteTour(deleteTour.id)
              .then(async () => {
                invalidateAdminTours();
                invalidateAdminPublishQueue();
                setTours(await refreshAdminTours());
                setDeleteTour(null);
                push({ message: ADMIN_UI.deleteTourSuccess });
              })
              .catch((caught) => {
                setDeleteError(caught instanceof Error ? caught.message : 'tour_delete_failed');
              })
              .finally(() => {
                setDeleteBusy(false);
              });
          }}
        />
      ) : null}
      {creating ? (
        <CreateTourModal
          lockedSeason={season}
          onClose={() => setCreating(false)}
          onCreated={(createdId) => {
            setCreating(false);
            void navigate(ADMIN_PATHS.tour(createdId));
          }}
        />
      ) : null}
    </AdminPageFrame>
  );
};

export default SeasonToursPage;
