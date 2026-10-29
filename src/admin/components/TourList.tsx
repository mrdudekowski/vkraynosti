import { useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  FilePen,
  Globe,
  GripVertical,
  Layers,
  LayoutGrid,
  List,
  ListPlus,
  Pencil,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_TOUR_LIST_VIEW_STORAGE_KEY } from '../../constants/adminUiTokens';
import type { AdminTourListItem } from '../api';
import {
  ADMIN_TOUR_VISIBILITY,
  matchesAdminTourVisibility,
  type AdminTourVisibilityFilter,
} from '../adminTourVisibility';
import { adminTourLiveVisibility, adminTourLiveVisibilityTone } from '../tourLiveVisibility';
import { adminIncidentBlocksMedia, useAdminIncident } from '../adminIncidentContext';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import { useAdminStoredState } from '../hooks/useAdminStoredState';
import { moveItemToIndex } from '../moveItem';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';
import AdminIconButton from './AdminIconButton';
import AdminDataList from './AdminDataList';
import AdminEmptyState from './AdminEmptyState';
import { AdminTextInput } from './AdminFields';
import AdminIcon from './AdminIcon';
import AdminReadinessBar from './AdminReadinessBar';
import AdminTourActionsMenu from './AdminTourActionsMenu';
import AdminTourCard from './AdminTourCard';
import TourCoverImage from './TourCoverImage';

type TourListProps = {
  tours: AdminTourListItem[];
  nearestByTourId?: Record<string, string>;
  busyTourId?: string | null;
  queuesVisibility?: boolean;
  onChangeGuestVisibility?: (tourId: string, status: 'hidden' | 'active') => void;
  onClone?: (tourId: string) => void;
  onDelete?: (tourId: string) => void;
  onAddTour?: () => void;
  onReorder?: (tourIds: string[]) => Promise<void> | void;
  reorderDisabled?: boolean;
  orderUnpublished?: boolean;
  onPublishOrder?: () => Promise<void> | void;
};

const TOUR_ORDER_DRAG = 'application/x-vkr-tour-order';

type TourReorderListProps = {
  tours: AdminTourListItem[];
  busy: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
};

const TourReorderList = ({ tours, busy, onMove }: TourReorderListProps) => (
  <ul className="flex flex-col gap-2" aria-label={ADMIN_UI.reorderTours}>
    {tours.map((tour, index) => (
      <li
        key={tour.id}
        className="flex items-center gap-2 rounded-admin-control border border-divider bg-surface-light px-2 py-1"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const fromIndex = Number.parseInt(event.dataTransfer.getData(TOUR_ORDER_DRAG), 10);
          if (!Number.isInteger(fromIndex)) {
            return;
          }
          onMove(fromIndex, index);
        }}
      >
        <button
          type="button"
          draggable
          disabled={busy}
          className="admin-icon-btn cursor-grab"
          aria-label={`${ADMIN_UI.dragItem}, ${tour.title}`}
          onDragStart={(event) => {
            event.dataTransfer.setData(TOUR_ORDER_DRAG, String(index));
            event.dataTransfer.effectAllowed = 'move';
          }}
        >
          <GripVertical aria-hidden size={16} strokeWidth={1.75} />
        </button>
        <span className="min-w-0 flex-1 truncate font-heading text-card text-text-primary">{tour.title}</span>
        <AdminIconButton
          icon={ChevronUp}
          label={`${ADMIN_UI.moveUp}, ${tour.title}`}
          className="admin-desktop:hidden"
          disabled={busy || index === 0}
          onClick={() => onMove(index, index - 1)}
        />
        <AdminIconButton
          icon={ChevronDown}
          label={`${ADMIN_UI.moveDown}, ${tour.title}`}
          className="admin-desktop:hidden"
          disabled={busy || index === tours.length - 1}
          onClick={() => onMove(index, index + 1)}
        />
      </li>
    ))}
  </ul>
);

type TourListView = 'cards' | 'list';
type TourReadinessFilter = 'all' | 'ready' | 'blockers';
type TourSort = 'default' | 'titleAsc' | 'readinessAsc';

const TOUR_VISIBILITY_ICON: Record<AdminTourVisibilityFilter, LucideIcon> = {
  all: Layers,
  on_site: Globe,
  in_development: Pencil,
  hidden: EyeOff,
  draft: FilePen,
};

function isTourListView(value: string): value is TourListView {
  return value === 'cards' || value === 'list';
}

const TourList = ({
  tours,
  nearestByTourId = {},
  busyTourId = null,
  queuesVisibility = false,
  onChangeGuestVisibility,
  onClone,
  onDelete,
  onAddTour,
  onReorder,
  reorderDisabled = false,
  orderUnpublished = false,
  onPublishOrder,
}: TourListProps) => {
  const navigate = useNavigate();
  const { incident } = useAdminIncident();
  const tourCreateDisabled = adminIncidentBlocksMedia(incident);
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<AdminTourVisibilityFilter>('all');
  const [readiness, setReadiness] = useState<TourReadinessFilter>('all');
  const [sort, setSort] = useState<TourSort>('default');
  const [storedView, setView] = useAdminStoredState(ADMIN_TOUR_LIST_VIEW_STORAGE_KEY, isTourListView);
  const [openMenuTourId, setOpenMenuTourId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [draftOrder, setDraftOrder] = useState<AdminTourListItem[] | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);
  const reorderLock = useRef(false);
  const view = storedView ?? 'cards';
  const reorderItems = draftOrder ?? tours;

  const toggleReorder = () => {
    if (reorderBusy) {
      return;
    }
    if (reordering) {
      setReordering(false);
      setDraftOrder(null);
      return;
    }
    setDraftOrder(tours);
    setReordering(true);
  };

  const moveTour = (fromIndex: number, toIndex: number) => {
    if (onReorder == null || reorderLock.current) {
      return;
    }
    const next = moveItemToIndex(reorderItems, fromIndex, toIndex);
    if (next === reorderItems) {
      return;
    }
    const previous = reorderItems;
    reorderLock.current = true;
    setReorderBusy(true);
    setDraftOrder(next);
    void Promise.resolve(onReorder(next.map((tour) => tour.id)))
      .catch(() => {
        setDraftOrder(previous);
      })
      .finally(() => {
        reorderLock.current = false;
        setReorderBusy(false);
      });
  };

  const visible = useMemo(
    () => {
      const filtered = tours.filter((tour) => {
        if (!matchesAdminTourVisibility(tour, visibility, query)) {
          return false;
        }
        return readiness === 'all' || (readiness === 'ready' ? tour.ready : !tour.ready);
      });
      if (sort === 'titleAsc') {
        return [...filtered].sort((left, right) => left.title.localeCompare(right.title, 'ru-RU'));
      }
      if (sort === 'readinessAsc') {
        return [...filtered].sort((left, right) => {
          if (left.ready !== right.ready) {
            return left.ready ? 1 : -1;
          }
          return left.title.localeCompare(right.title, 'ru-RU');
        });
      }
      return filtered;
    },
    [query, readiness, sort, tours, visibility],
  );

  if (tours.length === 0) {
    return (
      <AdminEmptyState
        title={ADMIN_UI.emptyList}
        description={ADMIN_UI.emptyListHint}
        icon={ListPlus}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 max-w-xl flex-1 flex-col gap-1">
          <label htmlFor="admin-tour-search" className="text-sm font-medium text-text-primary">
            {ADMIN_UI.searchTours}
          </label>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <AdminTextInput
                id="admin-tour-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex gap-1" role="group" aria-label={ADMIN_UI.tourListView}>
              <AdminButton
                type="button"
                variant={view === 'cards' ? 'secondary' : 'ghost'}
                className="w-11 px-0"
                aria-pressed={view === 'cards'}
                aria-label={ADMIN_UI.tourViewCards}
                title={ADMIN_UI.tourViewCards}
                onClick={() => setView('cards')}
              >
                <AdminIcon icon={LayoutGrid} size={16} />
              </AdminButton>
              <AdminButton
                type="button"
                variant={view === 'list' ? 'secondary' : 'ghost'}
                className="w-11 px-0"
                aria-pressed={view === 'list'}
                aria-label={ADMIN_UI.tourViewList}
                title={ADMIN_UI.tourViewList}
                onClick={() => setView('list')}
              >
                <AdminIcon icon={List} size={16} />
              </AdminButton>
              {onAddTour != null ? (
                <AdminButton
                  type="button"
                  className="ml-2"
                  disabled={tourCreateDisabled}
                  title={tourCreateDisabled ? ADMIN_UI.storageUnavailable : undefined}
                  onClick={() => {
                    if (tourCreateDisabled) {
                      return;
                    }
                    onAddTour();
                  }}
                >
                  {ADMIN_UI.addTour}
                </AdminButton>
              ) : null}
              {onReorder != null ? (
                <AdminButton
                  type="button"
                  variant="secondary"
                  className="ml-2"
                  disabled={reorderDisabled || reorderBusy}
                  onClick={toggleReorder}
                >
                  {reordering ? ADMIN_UI.reorderToursDone : ADMIN_UI.reorderTours}
                </AdminButton>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label={ADMIN_UI.tourVisibilityFilter}>
          {ADMIN_TOUR_VISIBILITY.map((item) => (
            <AdminButton
              key={item}
              type="button"
              variant={visibility === item ? 'secondary' : 'ghost'}
              className="gap-2"
              aria-pressed={visibility === item}
              onClick={() => setVisibility(item)}
            >
              <AdminIcon icon={TOUR_VISIBILITY_ICON[item]} size={16} />
              {ADMIN_UI.tourVisibility[item]}
            </AdminButton>
          ))}
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label={ADMIN_UI.tourReadinessFilter}>
          {(Object.keys(ADMIN_UI.tourReadiness) as TourReadinessFilter[]).map((item) => (
            <AdminButton
              key={item}
              type="button"
              variant={readiness === item ? 'secondary' : 'ghost'}
              aria-pressed={readiness === item}
              onClick={() => setReadiness(item)}
            >
              {ADMIN_UI.tourReadiness[item]}
            </AdminButton>
          ))}
        </div>
        <label className="flex max-w-xl flex-col gap-1 text-sm font-medium text-text-primary">
          {ADMIN_UI.tourSortFilter}
          <select
            className="admin-input"
            value={sort}
            onChange={(event) => setSort(event.target.value as TourSort)}
          >
            <option value="default">{ADMIN_UI.tourSort.default}</option>
            <option value="titleAsc">{ADMIN_UI.tourSort.titleAsc}</option>
            <option value="readinessAsc">{ADMIN_UI.tourSort.readinessAsc}</option>
          </select>
        </label>
      </div>
      {orderUnpublished ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-text-muted">{ADMIN_UI.reorderToursPending}</p>
          {onPublishOrder != null ? (
            <AdminButton type="button" variant="publish" onClick={() => void onPublishOrder()}>
              {ADMIN_UI.reorderToursPublish}
            </AdminButton>
          ) : null}
        </div>
      ) : null}
      {reordering ? (
        <TourReorderList tours={reorderItems} busy={reorderBusy} onMove={moveTour} />
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
                setVisibility('all');
                setReadiness('all');
                setSort('default');
              }}
            >
              {ADMIN_UI.emptySearchReset}
            </AdminButton>
          }
        />
      ) : view === 'list' ? (
        <AdminDataList
          titleHeader={ADMIN_UI.listTitle}
          statusHeader={ADMIN_UI.tourVisibilityFilter}
          items={visible.map((tour) => {
            const liveVisibility = adminTourLiveVisibility(tour);
            const nearest = nearestByTourId[tour.id];
            return {
              id: tour.id,
              label: tour.title,
              title: (
                <span className="flex min-w-0 items-center gap-3">
                  <TourCoverImage
                    src={tour.imageUrl}
                    alt={tour.title}
                    className="h-12 w-16 shrink-0 rounded-admin-control"
                  />
                  <span className="min-w-0 truncate">{tour.title}</span>
                </span>
              ),
              status: (
                <AdminBadge tone={adminTourLiveVisibilityTone(liveVisibility)}>
                  {ADMIN_UI.tourLiveVisibility[liveVisibility]}
                </AdminBadge>
              ),
              meta: (
                <div className="flex min-w-0 flex-col gap-1">
                  <AdminReadinessBar compact ready={tour.readyCount} total={tour.readyTotal} />
                  <span>{nearest != null ? nearest : ADMIN_UI.tourNearestNone}</span>
                </div>
              ),
              action:
                onChangeGuestVisibility != null || onClone != null || onDelete != null ? (
                  <AdminTourActionsMenu
                    tour={tour}
                    open={openMenuTourId === tour.id}
                    busy={busyTourId === tour.id}
                    queuesVisibility={queuesVisibility}
                    onOpenChange={(open) => {
                      setOpenMenuTourId(open ? tour.id : null);
                    }}
                    onHide={() => {
                      onChangeGuestVisibility?.(tour.id, 'hidden');
                    }}
                    onShow={() => {
                      onChangeGuestVisibility?.(tour.id, 'active');
                    }}
                    onClone={onClone == null ? undefined : () => onClone(tour.id)}
                    onDelete={onDelete == null ? undefined : () => onDelete(tour.id)}
                  />
                ) : null,
              onActivate: () => {
                void navigate(ADMIN_PATHS.tour(tour.id));
              },
            };
          })}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((tour) => (
            <li key={tour.id} className="flex">
              <AdminTourCard
                tour={tour}
                nearestStartsOn={nearestByTourId[tour.id]}
                menuOpen={openMenuTourId === tour.id}
                busy={busyTourId === tour.id}
                queuesVisibility={queuesVisibility}
                onMenuOpenChange={
                  onChangeGuestVisibility == null && onClone == null && onDelete == null
                    ? undefined
                    : (open) => {
                        setOpenMenuTourId(open ? tour.id : null);
                      }
                }
                onHideFromSite={
                  onChangeGuestVisibility == null
                    ? undefined
                    : () => {
                        onChangeGuestVisibility(tour.id, 'hidden');
                      }
                }
                onShowOnSite={
                  onChangeGuestVisibility == null
                    ? undefined
                    : () => {
                        onChangeGuestVisibility(tour.id, 'active');
                      }
                }
                onClone={onClone == null ? undefined : () => onClone(tour.id)}
                onDelete={onDelete == null ? undefined : () => onDelete(tour.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TourList;
