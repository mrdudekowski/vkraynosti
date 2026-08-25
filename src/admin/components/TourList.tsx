import { useMemo, useState } from 'react';
import {
  EyeOff,
  FilePen,
  Globe,
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
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import { useAdminStoredState } from '../hooks/useAdminStoredState';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';
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
  onAddTour?: () => void;
};

type TourListView = 'cards' | 'list';

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
  onAddTour,
}: TourListProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<AdminTourVisibilityFilter>('all');
  const [storedView, setView] = useAdminStoredState(ADMIN_TOUR_LIST_VIEW_STORAGE_KEY, isTourListView);
  const [openMenuTourId, setOpenMenuTourId] = useState<string | null>(null);
  const view = storedView ?? 'cards';

  const visible = useMemo(
    () => tours.filter((tour) => matchesAdminTourVisibility(tour, visibility, query)),
    [query, tours, visibility],
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
                <AdminButton type="button" className="ml-2" onClick={onAddTour}>
                  {ADMIN_UI.addTour}
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
      </div>
      {visible.length === 0 ? (
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
                onChangeGuestVisibility != null ? (
                  <AdminTourActionsMenu
                    tour={tour}
                    open={openMenuTourId === tour.id}
                    busy={busyTourId === tour.id}
                    queuesVisibility={queuesVisibility}
                    onOpenChange={(open) => {
                      setOpenMenuTourId(open ? tour.id : null);
                    }}
                    onHide={() => {
                      onChangeGuestVisibility(tour.id, 'hidden');
                    }}
                    onShow={() => {
                      onChangeGuestVisibility(tour.id, 'active');
                    }}
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
                  onChangeGuestVisibility == null
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
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TourList;
