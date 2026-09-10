import type { RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import type { AdminNavId, AdminNavItem } from '../constants/nav';
import { ADMIN_UI } from '../constants/ui';
import AdminDialog from './AdminDialog';
import AdminIcon from './AdminIcon';

export const ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE = 'application/x-admin-sidebar-overflow';

type AdminSidebarOverflowDialogProps = {
  items: readonly AdminNavItem[];
  onClose: () => void;
  onNavigate: (item: AdminNavItem) => void;
  onDragStart?: (itemId: AdminNavId) => void;
  onDragStateChange?: (dragging: boolean) => void;
  allowUnderlyingPointerEvents?: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  onDropOnVisible: (itemId: AdminNavId) => void;
  onReset: () => void;
};

const AdminSidebarOverflowDialog = ({
  items,
  onClose,
  onNavigate,
  onDragStart,
  onDragStateChange,
  allowUnderlyingPointerEvents = false,
  restoreFocusRef,
  onDropOnVisible,
  onReset,
}: AdminSidebarOverflowDialogProps) => {
  if (items.length === 0) return null;

  const overflowItemIds = new Set(items.map((item) => item.id));

  return (
    <AdminDialog
      title={ADMIN_UI.overflowNavTitle}
      titleId="admin-sidebar-overflow-title"
      closeLabel={ADMIN_UI.overflowNavClose}
      size="lg"
      onClose={onClose}
      allowUnderlyingPointerEvents={allowUnderlyingPointerEvents}
      restoreFocusRef={restoreFocusRef}
    >
      <p className="mb-3 text-sm text-text-secondary">{ADMIN_UI.overflowNavDragHint}</p>
      <div
        className="grid gap-2 sm:grid-cols-2"
        aria-label={`${ADMIN_UI.moreNav} (${items.length})`}
      >
        {items.map((item) => (
          <div key={item.id} className="min-w-0">
            <NavLink
            to={item.to}
            end={item.id === 'dashboard'}
            draggable
            className="admin-sidebar-nav flex min-w-0 items-center gap-3 border border-divider bg-surface-light/70"
            onClick={() => {
              onNavigate(item);
              onClose();
            }}
            onDragStart={(event) => {
              if (!overflowItemIds.has(item.id)) return;
              onDragStart?.(item.id);
              onDragStateChange?.(true);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData(ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE, item.id);
              event.dataTransfer.setData('text/plain', item.id);
            }}
            onDragEnd={(event) => {
              const payload = event.dataTransfer.getData(ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE);
              if (
                event.dataTransfer.dropEffect === 'move' &&
                overflowItemIds.has(payload as AdminNavId)
              ) {
                onDropOnVisible(payload as AdminNavId);
              }
              onDragStateChange?.(false);
            }}
          >
            <AdminIcon icon={item.icon} />
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="ml-auto text-text-secondary" aria-hidden>
              ⋮⋮
            </span>
            </NavLink>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end border-t border-divider pt-3">
        <button
          type="button"
          className="admin-button-secondary"
          onClick={onReset}
        >
          {ADMIN_UI.overflowNavReset}
        </button>
      </div>
    </AdminDialog>
  );
};

export default AdminSidebarOverflowDialog;
