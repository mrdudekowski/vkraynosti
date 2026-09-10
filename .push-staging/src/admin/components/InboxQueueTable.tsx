import { CalendarDays, Check, CircleAlert, Eye, Mountain, Send, Undo2 } from 'lucide-react';
import type { AdminPublishQueueItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import { formatAdminAbsoluteTime, formatAdminRelativeTime } from '../formatAdminCopy';
import {
  inboxQueueItemSubtitle,
  inboxQueueItemTitle,
  inboxQueueStatusLabel,
  isInboxQueueItemReady,
} from '../inboxQueueView';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';
import AdminIcon from './AdminIcon';
import AdminStatus from './AdminStatus';
import TourCoverImage from './TourCoverImage';

type InboxQueueTableProps = {
  items: AdminPublishQueueItem[];
  tourImageUrls?: Record<string, string | null>;
  busy: boolean;
  canPublishItem: (item: AdminPublishQueueItem) => boolean;
  canReturnItems?: boolean;
  onView: (item: AdminPublishQueueItem) => void;
  onNavigate?: (item: AdminPublishQueueItem) => void;
  onPublish: (item: AdminPublishQueueItem) => void;
  onReturn: (item: AdminPublishQueueItem) => void;
};

const InboxQueueTable = ({
  items,
  tourImageUrls = {},
  busy,
  canPublishItem,
  canReturnItems = false,
  onView,
  onNavigate,
  onPublish,
  onReturn,
}: InboxQueueTableProps) => (
  <div>
    <div className="admin-inbox-head">
      <span>{ADMIN_UI.inboxColumnType}</span>
      <span>{ADMIN_UI.inboxColumnName}</span>
      <span>{ADMIN_UI.inboxColumnStatus}</span>
      <span>{ADMIN_UI.inboxColumnAuthor}</span>
      <span>{ADMIN_UI.inboxColumnSent}</span>
      <span>{ADMIN_UI.inboxColumnReady}</span>
      <span>{ADMIN_UI.inboxColumnActions}</span>
    </div>
    <ul className="flex flex-col gap-2 admin-desktop:gap-0">
      {items.map((item) => {
        const ready = isInboxQueueItemReady(item);
        const canPublish = canPublishItem(item);
        return (
          <li key={`${item.kind}:${item.id}`} className="admin-inbox-row">
            <div className="flex items-center gap-2">
              <span className="admin-editor-icon-well">
                <AdminIcon icon={item.kind === 'tour' ? Mountain : CalendarDays} size={16} />
              </span>
              <AdminBadge tone={item.kind === 'tour' ? 'success' : 'warning'}>
                {item.kind === 'tour' ? ADMIN_UI.inboxTourItem : ADMIN_UI.inboxDepartureItem}
              </AdminBadge>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <TourCoverImage
                src={tourImageUrls[item.tourId]}
                alt={inboxQueueItemTitle(item)}
                className="h-10 w-14 shrink-0 rounded-admin-control"
              />
              <div className="min-w-0">
                <button type="button" className="text-left font-medium text-text-primary hover:underline" onClick={() => onNavigate?.(item)}>
                  {inboxQueueItemTitle(item)}
                </button>
                <p className="text-sm text-text-muted">{inboxQueueItemSubtitle(item)}</p>
              </div>
            </div>
            <AdminStatus level="primary" tone={ready ? (item.kind === 'tour' ? 'info' : 'warning') : 'danger'}>
              {inboxQueueStatusLabel(item)}
            </AdminStatus>
            <div className="min-w-0">
              <p className="text-sm text-text-primary">{item.author ?? ADMIN_UI.inboxAuthorUnknown}</p>
            </div>
            <div className="min-w-0">
              {item.timestamp != null ? (
                <>
                  <p className="text-sm text-text-primary">{formatAdminRelativeTime(item.timestamp)}</p>
                  <p className="text-tooltip text-text-muted">{formatAdminAbsoluteTime(item.timestamp)}</p>
                </>
              ) : (
                <p className="text-sm text-text-muted">{ADMIN_UI.inboxAuthorUnknown}</p>
              )}
            </div>
            <button type="button" className="text-left" onClick={() => !ready && onView(item)}>
              <AdminStatus level={ready ? 'secondary' : 'attention'} tone={ready ? 'success' : 'danger'} icon={ready ? Check : CircleAlert}>
                {ready ? ADMIN_UI.inboxReadyYes : ADMIN_UI.inboxHasBlockers}
              </AdminStatus>
            </button>
            <div className="flex flex-wrap items-center gap-1">
              <AdminButton
                type="button"
                variant="ghost"
                className="gap-2"
                disabled={busy}
                onClick={() => onView(item)}
              >
                <AdminIcon icon={Eye} size={16} />
                {ADMIN_UI.inboxView}
              </AdminButton>
              {canPublish && ready ? (
                <AdminButton type="button" className="gap-2" disabled={busy} onClick={() => onPublish(item)}>
                  <AdminIcon icon={Send} size={16} />
                  {ADMIN_UI.inboxPublishOne}
                </AdminButton>
              ) : null}
              {canReturnItems ? (
                <AdminButton
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  disabled={busy}
                  onClick={() => onReturn(item)}
                >
                  <AdminIcon icon={Undo2} size={16} />
                  {ADMIN_UI.inboxReturnShort}
                </AdminButton>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default InboxQueueTable;
