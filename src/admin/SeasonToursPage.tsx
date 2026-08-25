import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { adminCalendarSeason } from './adminCalendarSeason';
import {
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
        onChangeGuestVisibility={(id, status) => {
          void changeGuestVisibility(id, status);
        }}
      />
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
