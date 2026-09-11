import { Inbox, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ADMIN_PATHS } from './constants/routes';
import { ADMIN_INBOX_SORT_STORAGE_KEY, ADMIN_INBOX_TAB_STORAGE_KEY } from '../constants/adminUiTokens';
import {
  adminPublishQueue,
  adminReturnPublishQueue,
  adminListSiteContentChanges,
  type AdminPublishQueueItem,
  type AdminSiteContentChangesItem,
  type AdminSession,
} from './api';
import {
  getAdminPublishQueue,
  getAdminTours,
  invalidateAdminDepartures,
  invalidateAdminPublishQueue,
  invalidateAdminTours,
  peekAdminPublishQueue,
  peekAdminTours,
  refreshAdminPublishQueue,
} from './adminDataCache';
import AdminButton from './components/AdminButton';
import AdminConfirmDialog from './components/AdminConfirmDialog';
import AdminEmptyState from './components/AdminEmptyState';
import AdminErrorState from './components/AdminErrorState';
import { AdminTextArea, AdminTextInput } from './components/AdminFields';
import AdminPageFrame from './components/AdminPageFrame';
import AdminPageHeader from './components/AdminPageHeader';
import AdminSelect from './components/AdminSelect';
import AdminSheet from './components/AdminSheet';
import AdminSkeleton from './components/AdminSkeleton';
import InboxQueueTable from './components/InboxQueueTable';
import InboxSummaryCards from './components/InboxSummaryCards';
import { useAdminStoredState } from './hooks/useAdminStoredState';
import {
  INBOX_AUTHOR_ALL,
  INBOX_AUTHOR_UNKNOWN,
  INBOX_KIND_FILTERS,
  INBOX_READINESS_FILTERS,
  QUEUE_SUMMARY_LABEL,
  filterInboxQueueItems,
  inboxQueueAuthors,
  inboxQueueHasUnknownAuthor,
  inboxQueueItemTitle,
  isInboxQueueItemReady,
  inboxQueueStats,
  isInboxKindFilter,
  isInboxSort,
  type InboxKindFilter,
  type InboxReadinessFilter,
} from './inboxQueueView';
import { useAdminToast } from './toast/adminToastContext';
import { ADMIN_UI } from './constants/ui';

const KIND_FILTER_LABEL: Record<InboxKindFilter, string> = {
  all: ADMIN_UI.tourVisibility.all,
  tour: ADMIN_UI.inboxTabTours,
  departure: ADMIN_UI.inboxTabDepartures,
};

const READY_FILTER_LABEL: Record<InboxReadinessFilter, string> = {
  all: ADMIN_UI.inboxReadyAll,
  ready: ADMIN_UI.inboxReadyOnly,
  blockers: ADMIN_UI.inboxBlockersOnly,
};

function canPublishItem(session: AdminSession, item: AdminPublishQueueItem): boolean {
  return item.kind === 'tour' ? session.canPublishTours : session.canPublishSchedule;
}

function queuePayload(items: readonly AdminPublishQueueItem[]): {
  tourIds: string[];
  departureIds: string[];
  tourRevs: Record<string, number>;
} {
  const tours = items.filter((item) => item.kind === 'tour');
  return {
    tourIds: tours.map((item) => item.id),
    departureIds: items.filter((item) => item.kind === 'departure').map((item) => item.id),
    tourRevs: Object.fromEntries(
      tours.flatMap((item) => (item.rev == null ? [] : [[item.id, item.rev]])),
    ),
  };
}

const InboxPage = () => {
  const navigate = useNavigate();
  const { session } = useOutletContext<{ session: AdminSession }>();
  const { push } = useAdminToast();
  const [items, setItems] = useState<AdminPublishQueueItem[] | null>(() => peekAdminPublishQueue() ?? null);
  const [siteChanges, setSiteChanges] = useState<AdminSiteContentChangesItem[]>([]);
  const [tourImageUrls, setTourImageUrls] = useState<Record<string, string | null>>(
    () => Object.fromEntries((peekAdminTours() ?? []).map((tour) => [tour.id, tour.imageUrl])),
  );
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [detail, setDetail] = useState<AdminPublishQueueItem | null>(null);
  const [returnFor, setReturnFor] = useState<AdminPublishQueueItem[] | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [hideConfirmPayload, setHideConfirmPayload] = useState<{
    tourIds: string[];
    departureIds: string[];
    tourRevs: Record<string, number>;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [author, setAuthor] = useState<string>(INBOX_AUTHOR_ALL);
  const [readiness, setReadiness] = useState<InboxReadinessFilter>('all');
  const [storedKind, setStoredKind] = useAdminStoredState(ADMIN_INBOX_TAB_STORAGE_KEY, isInboxKindFilter);
  const [cardKind, setCardKind] = useState<InboxKindFilter | null>(null);
  const kind = cardKind ?? storedKind ?? 'all';
  const [storedSort, setSort] = useAdminStoredState(ADMIN_INBOX_SORT_STORAGE_KEY, isInboxSort);
  const sort = storedSort ?? 'newest';

  useEffect(() => {
    let cancelled = false;
    const request = reloadToken === 0 ? getAdminPublishQueue() : refreshAdminPublishQueue();
    void request
      .then((next) => {
        if (!cancelled) {
          setItems(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setItems([]);
        }
      });
    void getAdminTours()
      .then((tours) => {
        if (!cancelled) {
          setTourImageUrls(Object.fromEntries(tours.map((tour) => [tour.id, tour.imageUrl])));
        }
      })
      .catch(() => undefined);
    void adminListSiteContentChanges()
      .then((next) => { if (!cancelled) setSiteChanges(next); })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const stats = useMemo(() => inboxQueueStats(items ?? []), [items]);
  const authors = useMemo(() => inboxQueueAuthors(items ?? []), [items]);
  const hasUnknownAuthor = useMemo(() => inboxQueueHasUnknownAuthor(items ?? []), [items]);
  const visible = useMemo(
    () =>
      filterInboxQueueItems(items ?? [], {
        kind,
        readiness,
        author,
        query,
        sort,
      }),
    [author, items, kind, query, readiness, sort],
  );
  const publishable = visible.filter((item) => canPublishItem(session, item) && item.ready !== false);
  const canBulkPublish = publishable.length > 0;
  const selectedItems = visible.filter((item) => selectedKeys.has(`${item.kind}:${item.id}`));
  const selectedPublishable = selectedItems.filter(
    (item) => canPublishItem(session, item) && item.ready !== false,
  );
  const allVisibleSelected = visible.length > 0 && selectedItems.length === visible.length;
  const someVisibleSelected = selectedItems.length > 0;

  const refreshAfterMutation = () => {
    invalidateAdminTours();
    invalidateAdminDepartures();
    invalidateAdminPublishQueue();
    setSelectedKeys(new Set());
    setItems(null);
    setReloadToken((current) => current + 1);
  };

  const runPayload = (
    payload: {
      tourIds: string[];
      departureIds: string[];
      tourRevs: Record<string, number>;
    },
    confirmDeleteFutureDepartures = false,
  ) => {
    setBusy(true);
    void adminPublishQueue(
      confirmDeleteFutureDepartures
        ? { ...payload, confirmDeleteFutureDepartures: true }
        : payload,
    )
      .then(() => {
        setHideConfirmPayload(null);
        push({ message: ADMIN_UI.inboxPublished });
        refreshAfterMutation();
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.message === 'confirm_delete_future_departures') {
          setHideConfirmPayload(payload);
          return;
        }
        if (error instanceof Error && error.message === 'future_departures_have_leads') {
          push({ message: ADMIN_UI.publishHideHasLeads });
          return;
        }
        push({ message: ADMIN_UI.inboxPublishError });
      })
      .finally(() => setBusy(false));
  };

  return (
    <AdminPageFrame variant="wide">
      <AdminPageHeader
        title={ADMIN_UI.inboxTitle}
        description={ADMIN_UI.inboxDescription}
        breadcrumbs={[{ label: ADMIN_UI.dashboardNav, to: ADMIN_PATHS.dashboard }, { label: ADMIN_UI.inboxNav }]}
        action={
          canBulkPublish ? (
            <AdminButton
              type="button"
              variant="publish"
              disabled={busy || items == null}
              onClick={() => {
                runPayload(queuePayload(publishable));
              }}
            >
              {busy ? ADMIN_UI.inboxPublishing : ADMIN_UI.inboxPublishAll}
            </AdminButton>
          ) : null
        }
      />
      {loadError ? (
        <AdminErrorState
          title={ADMIN_UI.pageLoadError}
          onRetry={() => {
            setLoadError(false);
            setItems(null);
            setReloadToken((current) => current + 1);
          }}
        />
      ) : items == null ? (
        <AdminSkeleton variant="list" count={4} />
      ) : (
        <>
          <InboxSummaryCards
            tours={stats.tours}
            departures={stats.departures}
            blockers={stats.blockers}
            onShowTours={() => {
              setCardKind('tour');
              setReadiness('all');
            }}
            onShowDepartures={() => {
              setCardKind('departure');
              setReadiness('all');
            }}
            onShowBlockers={() => {
              setCardKind('all');
              setReadiness('blockers');
            }}
          />
          <section className="admin-card flex min-w-0 flex-col gap-3 p-4" aria-labelledby="inbox-site-changes-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="inbox-site-changes-title" className="text-lg font-semibold text-text-primary">Изменения «Сайт»</h2>
                <p className="mt-1 text-sm text-text-muted">Отдельный список всех изменений в черновиках страницы «Сайт».</p>
              </div>
              <AdminButton type="button" variant="ghost" onClick={() => navigate(ADMIN_PATHS.site)}>Открыть «Сайт»</AdminButton>
            </div>
            {siteChanges.length === 0 ? <p className="text-sm text-text-muted">Новых изменений нет.</p> : <div className="grid gap-3 md:grid-cols-2">{siteChanges.map((item) => <article key={item.kind} className="rounded-admin-control border border-divider p-3"><div className="flex items-start justify-between gap-3"><strong>{item.title}</strong><span className="text-xs text-text-muted">rev {item.rev}</span></div><ul className="mt-2 grid gap-1 text-sm text-text-muted">{item.changes.map((change) => <li key={`${item.kind}-${change.label}`}><span className="text-text-primary">{change.label}:</span> {change.from} → {change.to}</li>)}</ul></article>)}</div>}
          </section>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap gap-1" role="group" aria-label={ADMIN_UI.inboxTablist}>
                  {INBOX_KIND_FILTERS.map((item) => (
                    <AdminButton
                      key={item}
                      type="button"
                      variant={kind === item ? 'secondary' : 'ghost'}
                      aria-pressed={kind === item}
                      onClick={() => {
                        setCardKind(null);
                        setStoredKind(item);
                      }}
                    >
                      {KIND_FILTER_LABEL[item]}
                    </AdminButton>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1" role="group" aria-label={ADMIN_UI.inboxReadyFilter}>
                  {INBOX_READINESS_FILTERS.map((item) => (
                    <AdminButton
                      key={item}
                      type="button"
                      variant={readiness === item ? 'secondary' : 'ghost'}
                      aria-pressed={readiness === item}
                      onClick={() => setReadiness(item)}
                    >
                      {READY_FILTER_LABEL[item]}
                    </AdminButton>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="flex min-w-40 flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">{ADMIN_UI.inboxAuthorFilter}</span>
                  <AdminSelect
                    value={author}
                    onChange={(event) => {
                      setAuthor(event.target.value);
                    }}
                  >
                    <option value={INBOX_AUTHOR_ALL}>{ADMIN_UI.inboxAuthorAll}</option>
                    {hasUnknownAuthor ? (
                      <option value={INBOX_AUTHOR_UNKNOWN}>{ADMIN_UI.inboxAuthorUnknown}</option>
                    ) : null}
                    {authors.map((login) => (
                      <option key={login} value={login}>
                        {login}
                      </option>
                    ))}
                  </AdminSelect>
                </label>
                <label className="flex min-w-40 flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">{ADMIN_UI.inboxSort}</span>
                  <AdminSelect
                    value={sort}
                    onChange={(event) => {
                      if (isInboxSort(event.target.value)) {
                        setSort(event.target.value);
                      }
                    }}
                  >
                    <option value="newest">{ADMIN_UI.inboxSortNewest}</option>
                    <option value="oldest">{ADMIN_UI.inboxSortOldest}</option>
                  </AdminSelect>
                </label>
                <label className="flex min-w-48 flex-1 flex-col gap-1">
                  <span className="text-sm font-medium text-text-primary">{ADMIN_UI.inboxSearch}</span>
                  <AdminTextInput
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
              </div>
            </div>
            {items.length === 0 ? (
              <AdminEmptyState
                title={ADMIN_UI.inboxEmpty}
                description={ADMIN_UI.inboxEmptyHint}
                icon={Inbox}
              />
            ) : visible.length === 0 ? (
              <AdminEmptyState
                title={ADMIN_UI.emptySearch}
                icon={Search}
                action={
                  <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setQuery('');
                      setAuthor(INBOX_AUTHOR_ALL);
                      setStoredKind('all');
                      setCardKind(null);
                      setReadiness('all');
                    }}
                  >
                    {ADMIN_UI.emptySearchReset}
                  </AdminButton>
                }
              />
            ) : (
              <>
                {selectedItems.length > 0 ? (
                  <div className="sticky bottom-0 z-season-dock flex flex-col gap-2 rounded-admin-surface border border-divider bg-surface-light p-3 shadow-admin-overlay sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-text-primary">
                      {selectedItems.length} {ADMIN_UI.inboxSelectedCount}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <AdminButton
                        type="button"
                        variant="publish"
                        disabled={busy || selectedPublishable.length !== selectedItems.length}
                        onClick={() => runPayload(queuePayload(selectedPublishable))}
                      >
                        {ADMIN_UI.inboxPublishSelected}
                      </AdminButton>
                      <AdminButton
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => setSelectedKeys(new Set())}
                      >
                        {ADMIN_UI.inboxClearSelection}
                      </AdminButton>
                      {session.role === 'admin' ? (
                        <AdminButton
                          type="button"
                          variant="ghost"
                          disabled={busy}
                          onClick={() => {
                            setReturnFor(selectedItems);
                            setReturnReason('');
                          }}
                        >
                          {ADMIN_UI.inboxReturnSelected}
                        </AdminButton>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <InboxQueueTable
                  items={visible}
                  tourImageUrls={tourImageUrls}
                  selectedKeys={selectedKeys}
                  allItemsSelected={allVisibleSelected}
                  someItemsSelected={someVisibleSelected}
                  busy={busy}
                  canPublishItem={(item) => canPublishItem(session, item)}
                  canReturnItems={session.role === 'admin'}
                  onView={setDetail}
                  onToggleSelected={(item) => {
                    const key = `${item.kind}:${item.id}`;
                    setSelectedKeys((current) => {
                      const next = new Set(current);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      return next;
                    });
                  }}
                  onToggleAll={() => {
                    setSelectedKeys((current) => {
                      const next = new Set(current);
                      if (allVisibleSelected) {
                        visible.forEach((item) => next.delete(`${item.kind}:${item.id}`));
                      } else {
                        visible.forEach((item) => next.add(`${item.kind}:${item.id}`));
                      }
                      return next;
                    });
                  }}
                  onNavigate={(item) => {
                    navigate(item.kind === 'tour' ? ADMIN_PATHS.tour(item.tourId) : ADMIN_PATHS.scheduleDeparture(item.id, item.startsOn ?? ''));
                  }}
                  onPublish={(item) => {
                    runPayload(queuePayload([item]));
                  }}
                  onReturn={(item) => {
                    setReturnFor([item]);
                    setReturnReason('');
                  }}
                />
              </>
            )}
          </div>
        </>
      )}
      {detail != null ? (
        <AdminSheet
          title={ADMIN_UI.inboxDiffTitle}
          titleId="admin-inbox-diff"
          closeLabel={ADMIN_UI.closeOverlay}
          onClose={() => setDetail(null)}
        >
          <p className="text-sm text-text-muted">{inboxQueueItemTitle(detail)}</p>
          {detail.summary != null ? (
            <p className="mt-2 text-sm text-text-primary">{QUEUE_SUMMARY_LABEL[detail.summary]}</p>
          ) : null}
          {!isInboxQueueItemReady(detail) && detail.readiness?.blockers.length ? (
            <div className="mt-3 rounded-admin-control bg-difficulty-hard-bg p-3">
              <p className="text-sm font-medium text-text-primary">Причины блокировки</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-primary">
                {detail.readiness.blockers.map((blocker) => (
                  <li key={blocker.code}>
                    {({
                      cover_required: 'Нужна обложка',
                      bento_empty_slots: 'Заполните сетку изображений',
                      included_icon_required: 'Добавьте иконки к пунктам включено',
                      catalog_required: 'Заполните данные каталога',
                      about_required: 'Заполните описание тура',
                      included_required: 'Заполните состав тура',
                      program_required: 'Заполните программу тура',
                    } as Record<string, string>)[blocker.code] ?? 'Заполните обязательный раздел'}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {detail.kind === 'tour' &&
          detail.publishedPrice != null &&
          detail.price != null &&
          detail.publishedPrice !== detail.price ? (
            <p className="mt-2 text-sm text-text-primary">
              {ADMIN_UI.inboxDiffPrice}: {detail.publishedPrice} → {detail.price}
            </p>
          ) : null}
          {detail.kind === 'tour' &&
          detail.publishedSeason != null &&
          detail.season != null &&
          detail.publishedSeason !== detail.season ? (
            <p className="mt-2 text-sm text-text-primary">
              {ADMIN_UI.inboxDiffSeason}: {ADMIN_UI.seasons[detail.publishedSeason]} →{' '}
              {ADMIN_UI.seasons[detail.season]}
            </p>
          ) : null}
          {detail.kind === 'tour' &&
          detail.publishedStatus != null &&
          detail.status != null &&
          detail.publishedStatus !== detail.status ? (
            <p className="mt-2 text-sm text-text-primary">
              {ADMIN_UI.tourStatus[detail.publishedStatus]} → {ADMIN_UI.tourStatus[detail.status]}
            </p>
          ) : null}
          {detail.kind === 'departure' && detail.startsOn != null ? (
            <p className="mt-2 text-sm text-text-primary">
              {ADMIN_UI.inboxDiffDate}: {detail.startsOn}
            </p>
          ) : null}
          {detail.summary === 'new_tour' || detail.summary === 'new_departure' ? (
            <p className="mt-2 text-sm text-text-muted">{ADMIN_UI.inboxDiffEmpty}</p>
          ) : null}
        </AdminSheet>
      ) : null}
      {returnFor != null ? (
        <AdminSheet
          title={ADMIN_UI.inboxReturn}
          titleId="admin-inbox-return"
          closeLabel={ADMIN_UI.closeOverlay}
          onClose={() => setReturnFor(null)}
        >
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">{ADMIN_UI.inboxReturnReason}</span>
            <AdminTextArea
              value={returnReason}
              onChange={(event) => setReturnReason(event.target.value)}
              rows={3}
            />
          </label>
          <AdminButton
            className="mt-3"
            disabled={returnReason.trim().length === 0 || busy}
            onClick={() => {
              setBusy(true);
              void adminReturnPublishQueue({
                reason: returnReason.trim(),
                tourIds: returnFor.filter((item) => item.kind === 'tour').map((item) => item.id),
                departureIds: returnFor
                  .filter((item) => item.kind === 'departure')
                  .map((item) => item.id),
              })
                .then(() => {
                  push({ message: ADMIN_UI.inboxReturned });
                  setReturnFor(null);
                  refreshAfterMutation();
                })
                .catch(() => push({ message: ADMIN_UI.inboxReturnError }))
                .finally(() => setBusy(false));
            }}
          >
            {ADMIN_UI.inboxReturn}
          </AdminButton>
        </AdminSheet>
      ) : null}
      {hideConfirmPayload != null ? (
        <AdminConfirmDialog
          title={ADMIN_UI.publishHideConfirmTitle}
          description={ADMIN_UI.publishHideConfirmBody}
          confirmLabel={ADMIN_UI.publishHideConfirm}
          onConfirm={() => runPayload(hideConfirmPayload, true)}
          onClose={() => setHideConfirmPayload(null)}
        />
      ) : null}
    </AdminPageFrame>
  );
};

export default InboxPage;
