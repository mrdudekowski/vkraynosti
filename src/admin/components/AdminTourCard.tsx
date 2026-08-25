import { CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AdminTourListItem } from '../api';
import { adminTourHasPublicPage, adminTourPublicHref } from '../adminTourPublicHref';
import { ADMIN_PATHS } from '../constants/routes';
import { ADMIN_UI } from '../constants/ui';
import AdminBadge from './AdminBadge';
import AdminIcon from './AdminIcon';
import AdminReadinessBar from './AdminReadinessBar';
import AdminTourActionsMenu from './AdminTourActionsMenu';
import TourCoverImage from './TourCoverImage';
import { adminTourLiveVisibility, adminTourLiveVisibilityTone } from '../tourLiveVisibility';

type AdminTourCardProps = {
  tour: AdminTourListItem;
  nearestStartsOn?: string;
  menuOpen?: boolean;
  busy?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  onHideFromSite?: () => void;
  onShowOnSite?: () => void;
  queuesVisibility?: boolean;
};

const AdminTourCard = ({
  tour,
  nearestStartsOn,
  menuOpen = false,
  busy = false,
  onMenuOpenChange,
  onHideFromSite,
  onShowOnSite,
  queuesVisibility = false,
}: AdminTourCardProps) => {
  const liveVisibility = adminTourLiveVisibility(tour);
  const showMenu = onHideFromSite != null && onShowOnSite != null && onMenuOpenChange != null;

  return (
    <article className="admin-editor-surface relative flex h-full w-full flex-col gap-3">
      <div className="relative flex items-start gap-3">
        <Link
          to={ADMIN_PATHS.tour(tour.id)}
          className="flex min-w-0 flex-1 items-start gap-3 no-underline text-inherit"
        >
          <div className="flex w-28 shrink-0 flex-col gap-2">
            <TourCoverImage
              src={tour.imageUrl}
              alt=""
              className="h-20 w-28 rounded-admin-control"
            />
            <AdminReadinessBar compact ready={tour.readyCount} total={tour.readyTotal} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 pr-16">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1 font-heading text-card leading-tight text-text-primary">
                {tour.title}
              </h3>
            </div>
            <p className="flex items-center gap-1 text-sm text-text-muted">
              <AdminIcon icon={CalendarClock} size={16} />
              {nearestStartsOn != null
                ? `${ADMIN_UI.tourNearest}: ${nearestStartsOn}`
                : ADMIN_UI.tourNearestNone}
            </p>
          </div>
        </Link>
        <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
          <AdminBadge tone={adminTourLiveVisibilityTone(liveVisibility)}>
            {ADMIN_UI.tourLiveVisibility[liveVisibility]}
          </AdminBadge>
          {showMenu ? (
            <AdminTourActionsMenu
              tour={tour}
              open={menuOpen}
              busy={busy}
              onOpenChange={onMenuOpenChange}
              onHide={onHideFromSite}
              onShow={onShowOnSite}
              queuesVisibility={queuesVisibility}
            />
          ) : null}
        </div>
      </div>
      {adminTourHasPublicPage(tour) ? (
        <a
          href={adminTourPublicHref(tour)}
          target="_blank"
          rel="noreferrer"
          className="admin-btn-ghost self-start whitespace-nowrap no-underline"
        >
          {ADMIN_UI.tourOpenOnSite}
        </a>
      ) : null}
    </article>
  );
};

export default AdminTourCard;
