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
  overflowIds?: readonly AdminNavId[];
};

type DragPayload =
  | { type: typeof ADMIN_SIDEBAR_ITEM_DRAG_TYPE; value: number }
  | { type: typeof ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE; value: AdminNavId }
  | null;

type DropPosition = {
  index: number;
  edge: 'before' | 'after';
};

function getFinalVisibleIndex(
  fromIndex: number,
  targetIndex: number,
  edge: DropPosition['edge'],
  itemCount: number,
): number {
  const insertionIndex = targetIndex + (edge === 'after' ? 1 : 0);
  const adjustedIndex = fromIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
  return Math.max(0, Math.min(itemCount - 1, adjustedIndex));
}

function readDragPayload(dataTransfer: DataTransfer, overflowIds: ReadonlySet<AdminNavId>): DragPayload {
  const overflowId = dataTransfer.getData(ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE);
  if (overflowIds.has(overflowId as AdminNavId)) {
    return { type: ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE, value: overflowId as AdminNavId };
  }

  const indexValue = dataTransfer.getData(ADMIN_SIDEBAR_ITEM_DRAG_TYPE);
  if (!/^(0|[1-9]\d*)$/.test(indexValue)) {
    return null;
  }

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
  overflowIds = [],
}: AdminSidebarNavProps) => {
  const suppressClick = useRef(false);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const dropPositionRef = useRef<DropPosition | null>(null);
  const permittedOverflowIds = new Set(overflowIds);

  return (
    <>
      {items.map((item, index) => {
        const active = item.isActive(pathname);
        const navClassName = active ? 'admin-sidebar-nav-active' : 'admin-sidebar-nav';

        return (
          <div
            key={item.id}
            className="group relative flex min-w-0 items-center gap-1 rounded-admin-control"
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              const payload = readDragPayload(event.dataTransfer, permittedOverflowIds);
              if (payload == null || (payload.type === ADMIN_SIDEBAR_ITEM_DRAG_TYPE && payload.value === index)) {
                dropPositionRef.current = null;
                setDropPosition(null);
                return;
              }
              const rect = event.currentTarget.getBoundingClientRect();
              const nextPosition = {
                index,
                edge: event.clientY < rect.top + rect.height / 2 ? 'before' : 'after',
              } satisfies DropPosition;
              dropPositionRef.current = nextPosition;
              setDropPosition(nextPosition);
            }}
            onDragLeave={(event) => {
              const relatedTarget = event.relatedTarget as Node | null;
              if (relatedTarget != null && !event.currentTarget.contains(relatedTarget)) {
                dropPositionRef.current = null;
                setDropPosition(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const payload = readDragPayload(event.dataTransfer, permittedOverflowIds);
              if (payload?.type === ADMIN_SIDEBAR_ITEM_DRAG_TYPE) {
                const rect = event.currentTarget.getBoundingClientRect();
                const currentDropPosition = dropPositionRef.current;
                const edge = currentDropPosition?.index === index
                  ? currentDropPosition.edge
                  : event.clientY < rect.top + rect.height / 2
                    ? 'before'
                    : 'after';
                onReorder?.(
                  payload.value,
                  getFinalVisibleIndex(payload.value, index, edge, items.length),
                );
              } else if (payload?.type === ADMIN_SIDEBAR_OVERFLOW_DRAG_TYPE) {
                onDropOverflow?.(payload.value, index);
              }
              dropPositionRef.current = null;
              setDropPosition(null);
            }}
          >
            {dropPosition?.index === index ? (
              <span
                data-testid="admin-sidebar-drop-indicator"
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 z-10 h-0.5 rounded-full bg-brand-accent ${
                  dropPosition.edge === 'before' ? 'top-0' : 'bottom-0'
                }`}
              />
            ) : null}
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
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData(ADMIN_SIDEBAR_ITEM_DRAG_TYPE, String(index));
                event.dataTransfer.setData('text/plain', String(index));
              }}
              onDragEnd={() => {
                dropPositionRef.current = null;
                setDropPosition(null);
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
          </div>
        );
      })}
    </>
  );
};

export default AdminSidebarNav;
