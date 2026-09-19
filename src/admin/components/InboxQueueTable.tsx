import { Check, CircleAlert, Eye, Send, Undo2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { AdminPublishQueueItem } from '../api';
import { ADMIN_UI } from '../constants/ui';
import {
  formatAdminAbsoluteTime,
  formatAdminCompactDateTime,
  formatAdminRelativeTime,
} from '../formatAdminCopy';
import {
  inboxQueueItemSubtitle,
  inboxQueueItemTitle,
  inboxQueueStatusLabel,
  isInboxQueueItemReady,
} from '../inboxQueueView';
import AdminBadge from './AdminBadge';
import AdminButton from './AdminButton';
import AdminIcon from './AdminIcon';
import AdminIconButton from './AdminIconButton';
import AdminStatus from './AdminStatus';
import TourCoverImage from './TourCoverImage';

type InboxQueueTableProps = {
  items: AdminPublishQueueItem[];
  tourImageUrls?: Record<string, string | null>;
  selectedKeys: ReadonlySet<string>;
  allItemsSelected: boolean;
  someItemsSelected: boolean;
  busy: boolean;
  canPublishItem: (item: AdminPublishQueueItem) => boolean;
  canReturnItems?: boolean;
  onView: (item: AdminPublishQueueItem) => void;
  onToggleSelected: (item: AdminPublishQueueItem) => void;
  onToggleAll: () => void;
  onNavigate?: (item: AdminPublishQueueItem) => void;
  onPublish: (item: AdminPublishQueueItem) => void;
  onReturn: (item: AdminPublishQueueItem) => void;
};

const InboxQueueTable = ({
  items,
  tourImageUrls = {},
  selectedKeys,
  allItemsSelected,
  someItemsSelected,
  busy,
  canPublishItem,
  canReturnItems = false,
  onView,
  onToggleSelected,
  onToggleAll,
  onNavigate,
  onPublish,
  onReturn,
}: InboxQueueTableProps) => {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current != null) {
      selectAllRef.current.indeterminate = someItemsSelected && !allItemsSelected;
    }
  }, [allItemsSelected, someItemsSelected]);

  return (
    <div className="min-w-0">
      <div className="admin-inbox-head admin-inbox-grid">
        <label className="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            checked={allItemsSelected}
            ref={selectAllRef}
            aria-label={ADMIN_UI.inboxSelectAllVisible}
            onChange={onToggleAll}
          />
          <span className="hidden truncate admin-wide:inline">{ADMIN_UI.inboxSelect}</span>
        </label>
        <span className="hidden min-w-0 admin-desktop:block">{ADMIN_UI.inboxColumnType}</span>
        <span className="hidden min-w-0 admin-desktop:block">{ADMIN_UI.inboxColumnName}</span>
        <span className="hidden min-w-0 admin-desktop:block">{ADMIN_UI.inboxColumnStatus}</span>
        <span className="hidden min-w-0 admin-wide:block">{ADMIN_UI.inboxColumnAuthor}</span>
        <span className="hidden min-w-0 admin-wide:block">{ADMIN_UI.inboxColumnSent}</span>
        <span className="hidden min-w-0 admin-wide:block">{ADMIN_UI.inboxColumnReady}</span>
        <span className="hidden min-w-0 text-right admin-desktop:block">{ADMIN_UI.inboxColumnActions}</span>
      </div>
      <ul className="flex flex-col gap-2 admin-desktop:gap-0">
        {items.map((item) => {
          const ready = isInboxQueueItemReady(item);
          const canPublish = canPublishItem(item);
          const sentAbsolute = item.timestamp == null ? null : formatAdminAbsoluteTime(item.timestamp);
          const sentRelative = item.timestamp == null ? null : formatAdminRelativeTime(item.timestamp);
          const sentLabel =
            sentRelative == null || sentAbsolute == null
              ? null
              : sentRelative === sentAbsolute
                ? formatAdminCompactDateTime(item.timestamp)
                : sentRelative;
          return (
            <li key={`${item.kind}:${item.id}`} className="admin-inbox-row admin-inbox-grid">
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedKeys.has(`${item.kind}:${item.id}`)}
                  aria-label={`${ADMIN_UI.inboxSelectItem} ${item.kind === 'tour' ? ADMIN_UI.inboxTourItem : ADMIN_UI.inboxDepartureItem}: ${inboxQueueItemTitle(item)}`}
                  onChange={() => onToggleSelected(item)}
                />
              </label>
              <div className="min-w-0">
                <AdminBadge tone={item.kind === 'tour' ? 'success' : 'warning'}>
                  {item.kind === 'tour' ? ADMIN_UI.inboxTourItem : ADMIN_UI.inboxDepartureItem}
                </AdminBadge>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <TourCoverImage
                  src={tourImageUrls[item.tourId]}
                  alt=""
                  className="h-10 w-14 shrink-0 rounded-admin-control"
                />
                <div className="min-w-0">
                  <button
                    type="button"
                    className="line-clamp-2 text-left font-medium text-text-primary hover:underline"
                    onClick={() => onNavigate?.(item)}
                  >
                    {inboxQueueItemTitle(item)}
                  </button>
                  <p className="truncate text-sm text-text-muted">{inboxQueueItemSubtitle(item)}</p>
                </div>
              </div>
              <div className="min-w-0 overflow-hidden" title={inboxQueueStatusLabel(item)}>
                <AdminStatus level="primary" tone={ready ? (item.kind === 'tour' ? 'info' : 'warning') : 'danger'}>
                  {inboxQueueStatusLabel(item)}
                </AdminStatus>
              </div>
              <p className="min-w-0 truncate text-sm text-text-primary admin-desktop:hidden admin-wide:block">
                {item.author ?? ADMIN_UI.inboxAuthorUnknown}
              </p>
              <div className="min-w-0 admin-desktop:hidden admin-wide:block">
                {sentLabel != null ? (
                  <p className="truncate text-sm text-text-primary" title={sentAbsolute ?? undefined}>
                    {sentLabel}
                  </p>
                ) : (
                  <p className="text-sm text-text-muted">{ADMIN_UI.inboxAuthorUnknown}</p>
                )}
              </div>
              <button
                type="button"
                className="min-w-0 text-left admin-desktop:hidden admin-wide:block"
                onClick={() => !ready && onView(item)}
              >
                <AdminStatus
                  level={ready ? 'secondary' : 'attention'}
                  tone={ready ? 'success' : 'danger'}
                  icon={ready ? Check : CircleAlert}
                >
                  {ready ? ADMIN_UI.inboxReadyYes : ADMIN_UI.inboxHasBlockers}
                </AdminStatus>
              </button>
              <div className="flex flex-nowrap items-center justify-end gap-1">
                <AdminIconButton
                  icon={Eye}
                  label={ADMIN_UI.inboxView}
                  disabled={busy}
                  onClick={() => onView(item)}
                />
                {canPublish && ready ? (
                  <AdminButton
                    type="button"
                    variant="publish"
                    className="px-2.5"
                    disabled={busy}
                    aria-label={ADMIN_UI.inboxPublishOne}
                    title={ADMIN_UI.inboxPublishOne}
                    onClick={() => onPublish(item)}
                  >
                    <AdminIcon icon={Send} size={16} />
                  </AdminButton>
                ) : null}
                {canReturnItems ? (
                  <AdminIconButton
                    icon={Undo2}
                    label={ADMIN_UI.inboxReturnShort}
                    disabled={busy}
                    onClick={() => onReturn(item)}
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default InboxQueueTable;
