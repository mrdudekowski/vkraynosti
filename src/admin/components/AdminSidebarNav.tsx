import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { AdminNavId, AdminNavItem } from '../constants/nav';
import { ADMIN_UI } from '../constants/ui';
import AdminIcon from './AdminIcon';

export const ADMIN_SIDEBAR_ITEM_DRAG_TYPE = 'application/x-admin-sidebar-item';
export const ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE = 'application/x-admin-sidebar-overflow';

type AdminSidebarNavProps = {
  items: readonly AdminNavItem[];
  compact: boolean;
  pathname: string;
  onNavigate?: () => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onDropOverflow?: (overflowId: AdminNavId, visibleIndex: number) => void;
};

type DragPayload =
  | { type: typeof ADMIN_SIDEBAR_ITEM_DRAG_TYPE; value: number }
  | { type: typeof ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE; value: AdminNavId }
  | null;

function readDragPayload(dataTransfer: DataTransfer): DragPayload {
  const overflowId = dataTransfer.getData(ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE);
  if (overflowId) {
    return { type: ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE, value: overflowId as AdminNavId };
  }

  const indexValue = dataTransfer.getData(ADMIN_SIDEBAR_ITEM_DRAG_TYPE);
  const index = Number(indexValue);
  return Number.isInteger(index) ? { type: ADMIN_SIDEBAR_ITEM_DRAG_TYPE, value: index } : null;
}

const AdminSidebarNav = ({
  items,
  compact,
  pathname,
  onNavigate,
  onReorder,
  onDropOverflow,
}: AdminSidebarNavProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const suppressClick = useRef(false);

  return (
    <>
      {items.map((item, index) => {
        const active = item.isActive(pathname);
        const moveUpDisabled = index === 0;
        const moveDownDisabled = index === items.length - 1;
        const navClassName = active ? 'admin-sidebar-nav-active' : 'admin-sidebar-nav';

        return (
          <div
            key={item.id}
            className={`group flex min-w-0 items-center gap-1 rounded-admin-control ${
              draggedIndex === index ? 'opacity-60' : ''
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              event.preventDefault();
              const payload = readDragPayload(event.dataTransfer);
              if (payload?.type === ADMIN_SIDEBAR_ITEM_DRAG_TYPE) {
                onReorder?.(payload.value, index);
              } else if (payload?.type === ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE) {
                onDropOverflow?.(payload.value, index);
              }
              setDraggedIndex(null);
            }}
          >
            <NavLink
              to={item.to}
              end={item.id === 'dashboard'}
              title={compact ? item.label : undefined}
              onClick={(event) => {
                if (suppressClick.current) {
                  event.preventDefault();
                  return;
                }
                onNavigate?.();
              }}
              onDragStart={(event) => {
                suppressClick.current = true;
                setDraggedIndex(index);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData(ADMIN_SIDEBAR_ITEM_DRAG_TYPE, String(index));
                event.dataTransfer.setData('text/plain', String(index));
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                window.setTimeout(() => {
                  suppressClick.current = false;
                }, 0);
              }}
              draggable
              className={`${navClassName} min-w-0 flex-1`}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={`h-5 w-0.5 shrink-0 rounded-full ${
                  active ? 'bg-brand-accent' : 'bg-transparent'
                }`}
              />
              <AdminIcon icon={item.icon} />
              <span className={compact ? 'sr-only' : 'min-w-0 truncate'}>{item.label}</span>
              {item.soon ? (
                <span className={compact ? 'hidden' : 'admin-badge-neutral'} aria-hidden>
                  {ADMIN_UI.soon}
                </span>
              ) : null}
            </NavLink>
            <span className="hidden shrink-0 items-center group-focus-within:flex group-hover:flex sm:inline-flex">
              <button
                type="button"
                className="rounded-admin-control p-1 text-text-inverse/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary disabled:opacity-40"
                aria-label={ADMIN_UI.moveUp}
                title={`${ADMIN_UI.moveUp}: ${item.label}`}
                disabled={moveUpDisabled}
                onClick={() => onReorder?.(index, index - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="rounded-admin-control p-1 text-text-inverse/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-primary disabled:opacity-40"
                aria-label={ADMIN_UI.moveDown}
                title={`${ADMIN_UI.moveDown}: ${item.label}`}
                disabled={moveDownDisabled}
                onClick={() => onReorder?.(index, index + 1)}
              >
                ↓
              </button>
            </span>
          </div>
        );
      })}
    </>
  );
};

export default AdminSidebarNav;
