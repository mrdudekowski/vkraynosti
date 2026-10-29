import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { adminCalendarSeason } from './adminCalendarSeason';
import {
  adminCloneTour,
  adminDeleteTour,
  adminGetTourCatalogOrder,
  adminPublishTourOrder,
  adminSaveTourOrder,
  type AdminDeparture,
  type AdminSession,
  type AdminTourCatalogOrder,
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

function reorderToursInSeason(
  tours: AdminTourListItem[],
  season: Season,
  tourIds: string[],
): AdminTourListItem[] {
  const toursById = new Map(
    tours.filter((tour) => tour.season === season).map((tour) => [tour.id, tour]),
  );
  const orderedSeasonTours: AdminTourListItem[] = [];
  for (const tourId of tourIds) {
    const tour = toursById.get(tourId);
    if (tour != null) {
      orderedSeasonTours.push(tour);
    }
  }
  let nextSeasonTourIndex = 0;
  return tours.map((tour) => {
    if (tour.season !== season) {
      return tour;
    }
    const replacement = orderedSeasonTours[nextSeasonTourIndex];
    nextSeasonTourIndex += 1;
    return replacement ?? tour;
  });
}

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
  const { session } = useOutletContext<{ session: AdminSession }>();
  const { push } = useAdminToast();
  const navigate = useNavigate();
  const catalogOrderRef = useRef<AdminTourCatalogOrder>({ rev: 0, unpublished: false });
  const catalogOrderQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [catalogOrderReady, setCatalogOrderReady] = useState(false);
  const [catalogOrderUnpublished, setCatalogOrderUnpublished] = useState(false);
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

  useEffect(() => {
    let cancelled = false;
    void adminGetTourCatalogOrder()
      .then((order) => {
        if (cancelled) {
          return;
        }
        catalogOrderRef.current = { rev: order.rev, unpublished: order.unpublished };
        setCatalogOrderUnpublished(order.unpublished);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        catalogOrderRef.current = { rev: 0, unpublished: false };
        setCatalogOrderUnpublished(false);
      })
      .finally(() => {
        if (!cancelled) {
          setCatalogOrderReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const enqueueCatalogOrder = (task: () => Promise<void>) => {
    const run = catalogOrderQueueRef.current.then(task);
    catalogOrderQueueRef.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  const saveTourOrder = (tourIds: string[]) =>
    enqueueCatalogOrder(async () => {
      try {
        const saved = await adminSaveTourOrder({
          rev: catalogOrderRef.current.rev,
          season,
          tourIds,
        });
        catalogOrderRef.current = { rev: saved.rev, unpublished: saved.unpublished };
        setCatalogOrderUnpublished(saved.unpublished);
        setTours((current) =>
          current == null ? current : reorderToursInSeason(current, season, tourIds),
        );
      } catch (caught) {
        push({ message: ADMIN_UI.reorderToursError });
        throw caught;
      }
    });

  const publishTourOrder = () =>
    enqueueCatalogOrder(async () => {
      try {
        const published = await adminPublishTourOrder(catalogOrderRef.current.rev);
        catalogOrderRef.current = { rev: published.rev, unpublished: false };
        setCatalogOrderUnpublished(false);
        invalidateAdminTours();
        setTours(await refreshAdminTours());
        push({ message: ADMIN_UI.reorderToursPublished });
      } catch {
        push({ message: ADMIN_UI.reorderToursPublishError });
      }
    });

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
        onReorder={saveTourOrder}
        reorderDisabled={!catalogOrderReady}
        orderUnpublished={catalogOrderUnpublished}
        onPublishOrder={session.canPublishTours ? publishTourOrder : undefined}
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
