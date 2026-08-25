import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  HOME_DEPARTURE_LOOKAHEAD_DAYS,
  HOME_DEPARTURE_LOOKBACK_DAYS,
  currentDepartures,
  nearestDepartureDays,
} from '../cms/homeDepartures';
import {
  type AdminDeparture,
  type AdminPublishQueueItem,
  type AdminSession,
  type AdminTourListItem,
  adminUpdateDeparture,
} from './api';
import {
  getAdminDepartures,
  getAdminPublishQueue,
  getAdminTours,
  invalidateAdminDepartures,
  invalidateAdminPublishQueue,
  peekAdminDepartures,
  peekAdminPublishQueue,
  peekAdminTours,
  refreshAdminDepartures,
  refreshAdminPublishQueue,
  refreshAdminTours,
} from './adminDataCache';
import type { DepartureQuickStatus } from './departureQuickStatus';
import { adminTourVisibility, countToursOnSite } from './adminTourVisibility';
import AdminErrorState from './components/AdminErrorState';
import AdminDashboardAttentionList, {
  type DashboardAttentionItem,
} from './components/AdminDashboardAttentionList';
import AdminEmptyState from './components/AdminEmptyState';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSkeleton from './components/AdminSkeleton';
import DashboardDepartureList from './components/DashboardDepartureList';
import { ADMIN_PATHS } from './constants/routes';
import { ADMIN_UI } from './constants/ui';
import { ATTENTION_TAB_QUERY } from './tourEditorTabs';
import { formatAdminCancelledThisWeek, formatAdminOnSiteCount } from './formatAdminCopy';
import { addIsoDays, startOfIsoWeek, vladivostokCalendarDate } from './scheduleCalendar';
import { CircleAlert } from 'lucide-react';

function weekCancelledCount(departures: AdminDeparture[], todayIso: string): number {
  const weekStart = startOfIsoWeek(todayIso);
  const weekEnd = addIsoDays(weekStart, 6);
  return departures.filter(
    (departure) =>
      departure.status === 'cancelled' &&
      departure.startsOn >= weekStart &&
      departure.startsOn <= weekEnd,
  ).length;
}

const DashboardPage = () => {
  const { session } = useOutletContext<{ session: AdminSession }>();
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
  const [queue, setQueue] = useState<AdminPublishQueueItem[]>(() => peekAdminPublishQueue() ?? []);
  const [listError, setListError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const toursRef = useRef(tours);

  useEffect(() => {
    toursRef.current = tours;
  }, [tours]);

  const reload = useCallback(() => {
    setListError(false);
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const toursRequest = reloadToken === 0 ? getAdminTours() : refreshAdminTours();
    const departuresRequest = reloadToken === 0
      ? getAdminDepartures(departureRange)
      : refreshAdminDepartures(departureRange);
    const queueRequest = reloadToken === 0 ? getAdminPublishQueue() : refreshAdminPublishQueue();

    void toursRequest
      .then((nextTours) => {
        if (!cancelled) {
          setTours(nextTours);
          setListError(false);
        }
      })
      .catch(() => {
        if (!cancelled && toursRef.current == null) {
          setListError(true);
        }
      });
    void departuresRequest.then((nextDepartures) => {
      if (!cancelled) {
        setDepartures(nextDepartures);
      }
    });
    void queueRequest
      .then((nextQueue) => {
        if (!cancelled) {
          setQueue(nextQueue);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [departureRange, reloadToken]);

  const changeQuickStatus = async (departure: AdminDeparture, status: DepartureQuickStatus) => {
    try {
      const updated = await adminUpdateDeparture(departure.id, {
        version: departure.version,
        status,
      });
      setDepartures((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      invalidateAdminDepartures();
      invalidateAdminPublishQueue();
    } catch {
      return;
    }
  };

  if (listError) {
    return (
      <AdminPageFrame variant="wide">
        <AdminErrorState title={ADMIN_UI.pageLoadError} onRetry={reload} />
      </AdminPageFrame>
    );
  }
  if (tours == null) {
    return (
      <AdminPageFrame variant="wide">
        <AdminSkeleton variant="cards" count={4} />
      </AdminPageFrame>
    );
  }

  const titles = Object.fromEntries(tours.map((tour) => [tour.id, tour.title]));
  const tourImageUrls = Object.fromEntries(tours.map((tour) => [tour.id, tour.imageUrl]));
  const returned = tours.filter((tour) => tour.returnReason != null && tour.returnReason.length > 0);
  const returnedIds = new Set(returned.map((tour) => tour.id));
  const brokenLive = tours.filter(
    (tour) =>
      !tour.ready &&
      adminTourVisibility(tour) === 'on_site' &&
      !returnedIds.has(tour.id),
  );
  const cancelledCount = weekCancelledCount(departures, todayIso);
  const myQueue =
    session.role === 'editor'
      ? queue.filter((item) => item.author === session.login)
      : queue;
  const attentionItems: DashboardAttentionItem[] = [
    ...returned.map((tour) => ({
      id: `return-${tour.id}`,
      title: tour.title,
      issue: `${ADMIN_UI.dashboardReturned}: ${tour.returnReason}`,
      severity: 'critical' as const,
      to: ADMIN_PATHS.tour(tour.id, ATTENTION_TAB_QUERY),
      imageUrl: tour.imageUrl,
    })),
    ...brokenLive.map((tour) => ({
      id: `ready-${tour.id}`,
      title: tour.title,
      issue: `${ADMIN_UI.dashboardReadinessIncomplete}: ${tour.readyTotal - tour.readyCount} ${ADMIN_UI.readinessReady}`,
      severity: 'prepublication' as const,
      to: ADMIN_PATHS.tour(tour.id, ATTENTION_TAB_QUERY),
      imageUrl: tour.imageUrl,
    })),
    ...myQueue.map((item) => ({
      id: `queue-${item.kind}-${item.id}`,
      title: item.title ?? item.tourId ?? item.startsOn ?? item.id,
      issue: ADMIN_UI.dashboardQueueAttention,
      severity: 'later' as const,
      to:
        item.kind === 'departure' && item.startsOn != null
          ? ADMIN_PATHS.scheduleDeparture(item.id, item.startsOn)
          : item.kind === 'tour'
            ? ADMIN_PATHS.tour(item.id)
            : ADMIN_PATHS.inbox,
      imageUrl: tours.find((tour) => tour.id === item.tourId)?.imageUrl ?? null,
    })),
  ];
  const onSiteCount = countToursOnSite(tours);
  const currentItems = currentDepartures(departures, new Date());
  const nearestItems = nearestDepartureDays(departures, todayIso)
    .flatMap((day) => departures.filter((departure) => departure.startsOn === day))
    .filter((departure) => departure.status !== 'completed');

  return (
    <AdminPageFrame variant="wide">
      <AdminPageHeader
        title={ADMIN_UI.dashboardTitle}
        description={ADMIN_UI.dashboardDescription}
        action={
          <Link to={ADMIN_PATHS.inbox} className="admin-btn-primary no-underline">
            {ADMIN_UI.dashboardOpenInbox}
          </Link>
        }
      />
      <section aria-label={ADMIN_UI.dashboardTitle} className="flex flex-wrap divide-x divide-divider border-y border-divider">
        <div className="min-w-40 flex-1 px-4 py-3">
          <p className="text-xs text-text-muted">{ADMIN_UI.dashboardMetricAttention}</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{attentionItems.length}</p>
        </div>
        <div className="min-w-40 flex-1 px-4 py-3">
          <p className="text-xs text-text-muted">{ADMIN_UI.homeCurrent}</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{currentItems.length}</p>
        </div>
        <div className="min-w-40 flex-1 px-4 py-3">
          <p className="text-xs text-text-muted">{ADMIN_UI.dashboardMetricPublicationQueue}</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{myQueue.length}</p>
        </div>
        <div className="min-w-40 flex-1 px-4 py-3">
          <p className="text-xs text-text-muted">{ADMIN_UI.dashboardMetricOnSite}</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {formatAdminOnSiteCount(onSiteCount.onSite, onSiteCount.total)}
          </p>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="border-y border-divider py-3">
            {currentItems.length > 0 ? (
              <DashboardDepartureList
                title={ADMIN_UI.homeCurrent}
                emptyTitle={ADMIN_UI.homeCurrentEmpty}
                emptyDescription={ADMIN_UI.dashboardUpcomingEmptyDescription}
                actionLabel={ADMIN_UI.dashboardOpenCalendar}
                actionTo={ADMIN_PATHS.schedule}
                departures={currentItems}
                tourTitles={titles}
                tourImageUrls={tourImageUrls}
                todayIso={todayIso}
                variant="current"
                onStatusChange={(departure, status) => {
                  void changeQuickStatus(departure, status);
                }}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{ADMIN_UI.dashboardCurrentQuiet}</p>
                  {nearestItems[0] != null ? (
                    <p className="mt-1 text-sm text-text-muted">
                      {`${ADMIN_UI.dashboardNextDeparture}: ${titles[nearestItems[0].tourId] ?? nearestItems[0].tourId}`}
                    </p>
                  ) : null}
                </div>
                <Link to={ADMIN_PATHS.schedule} className="admin-btn-ghost no-underline">
                  {ADMIN_UI.dashboardOpenCalendar}
                </Link>
              </div>
            )}
          </section>
          <DashboardDepartureList
            title={ADMIN_UI.homeNearest}
            emptyTitle={ADMIN_UI.homeNearestEmpty}
            emptyDescription={ADMIN_UI.dashboardUpcomingEmptyDescription}
            actionLabel={ADMIN_UI.dashboardOpenCalendar}
            actionTo={ADMIN_PATHS.schedule}
            departures={nearestItems}
            tourTitles={titles}
            tourImageUrls={tourImageUrls}
            todayIso={todayIso}
            onStatusChange={(departure, status) => {
              void changeQuickStatus(departure, status);
            }}
          />
        </div>
        <section className="flex min-w-0 flex-col gap-2">
          <h2 className="text-lg font-semibold text-text-primary">{ADMIN_UI.dashboardAttention}</h2>
          {attentionItems.length === 0 ? (
            <AdminEmptyState title={ADMIN_UI.dashboardAttentionEmpty} icon={CircleAlert} />
          ) : (
            <AdminDashboardAttentionList items={attentionItems.slice(0, 8)} />
          )}
          {attentionItems.length > 8 ? (
            <Link to={ADMIN_PATHS.inbox} className="admin-btn-ghost w-fit no-underline">
              {ADMIN_UI.dashboardMoreAttention}
            </Link>
          ) : null}
          {cancelledCount > 0 ? (
            <Link
              to={ADMIN_PATHS.schedule}
              className="text-sm text-text-muted no-underline admin-nav-item w-fit"
            >
              {formatAdminCancelledThisWeek(cancelledCount)}
            </Link>
          ) : null}
        </section>
      </section>
    </AdminPageFrame>
  );
};

export default DashboardPage;
