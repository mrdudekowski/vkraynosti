import { useState, type RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import type { AdminNavId, AdminNavItem } from '../constants/nav';
import { ADMIN_UI } from '../constants/ui';
import AdminDialog from './AdminDialog';
import AdminIcon from './AdminIcon';

export const ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE = 'application/x-admin-sidebar-overflow';

type AdminSidebarOverflowDialogProps = {
  items: readonly AdminNavItem[];
  visibleItems?: readonly Pick<AdminNavItem, 'id' | 'label'>[];
  onClose: () => void;
  onNavigate: (item: AdminNavItem) => void;
  onDragStart?: (itemId: AdminNavId) => void;
  onDragStateChange?: (dragging: boolean) => void;
  allowUnderlyingPointerEvents?: boolean;
  restoreFocusRef?: RefObject<HTMLElement | null>;
  onDropOnVisible: (itemId: AdminNavId) => void;
  onKeyboardExchange?: (itemId: AdminNavId, visibleIndex: number) => void;
  onReset: () => void;
};

const AdminSidebarOverflowDialog = ({
  items,
  visibleItems = [],
  onClose,
  onNavigate,
  onDragStart,
  onDragStateChange,
  allowUnderlyingPointerEvents = false,
  restoreFocusRef,
  onDropOnVisible,
  onKeyboardExchange,
  onReset,
}: AdminSidebarOverflowDialogProps) => {
  const [keyboardTargets, setKeyboardTargets] = useState<Record<string, AdminNavId>>({});

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
            {visibleItems.length > 0 ? (
            <div className="col-span-full flex min-w-0 items-end gap-2 rounded-admin-control border border-divider/70 bg-surface-light/40 p-2">
              <label className="sr-only" htmlFor={`admin-sidebar-target-${item.id}`}>
                {ADMIN_UI.overflowNavTargetLabel(item.label)}
              </label>
              <select
                id={`admin-sidebar-target-${item.id}`}
                className="admin-input min-w-0 flex-1"
                aria-label={ADMIN_UI.overflowNavTargetLabel(item.label)}
                value={keyboardTargets[item.id] ?? visibleItems[0]?.id ?? ''}
                onChange={(event) => {
                  setKeyboardTargets((current) => ({
                    ...current,
                    [item.id]: event.target.value as AdminNavId,
                  }));
                }}
              >
                {visibleItems.map((visibleItem) => (
                  <option key={visibleItem.id} value={visibleItem.id}>
                    {visibleItem.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="admin-button-secondary shrink-0"
                aria-label={ADMIN_UI.overflowNavTargetLabel(item.label)}
                onClick={() => {
                  const targetId = keyboardTargets[item.id] ?? visibleItems[0]?.id;
                  const targetIndex = visibleItems.findIndex(({ id }) => id === targetId);
                  if (targetId == null || targetIndex < 0) return;
                  onKeyboardExchange?.(item.id, targetIndex);
                }}
                disabled={onKeyboardExchange == null}
              >
                {ADMIN_UI.overflowNavTargetLabel(item.label)}
              </button>
            </div>
            ) : null}
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
