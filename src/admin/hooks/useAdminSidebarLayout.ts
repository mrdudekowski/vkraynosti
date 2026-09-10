import { useEffect, useState } from 'react';
import type { AdminNavId, AdminNavItem } from '../constants/nav';
import {
  type AdminSidebarLayout,
  createDefaultAdminSidebarLayout,
  exchangeAdminSidebarItem,
  normalizeAdminSidebarLayout,
  reorderVisibleAdminSidebarItem,
} from '../adminSidebarLayout';

export const ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY = 'admin.sidebar.layout.v1';

function readLayout(items: readonly AdminNavItem[], enabled: boolean): AdminSidebarLayout {
  if (!enabled) {
    return createDefaultAdminSidebarLayout(items);
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY);
    return normalizeAdminSidebarLayout(raw == null ? null : JSON.parse(raw), items);
  } catch {
    return createDefaultAdminSidebarLayout(items);
  }
}

function layoutsEqual(left: AdminSidebarLayout, right: AdminSidebarLayout): boolean {
  return (
    left.visibleOrder.length === right.visibleOrder.length &&
    left.overflowOrder.length === right.overflowOrder.length &&
    left.visibleOrder.every((id, index) => id === right.visibleOrder[index]) &&
    left.overflowOrder.every((id, index) => id === right.overflowOrder[index])
  );
}

function writeLayout(layout: AdminSidebarLayout): void {
  try {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY,
      JSON.stringify({
        visibleOrder: layout.visibleOrder,
        overflowOrder: layout.overflowOrder,
      }),
    );
  } catch {
    /* quota / private mode */
  }
}

export function useAdminSidebarLayout(
  items: readonly AdminNavItem[],
  enabled: boolean,
): {
  layout: AdminSidebarLayout;
  overflowItems: AdminNavItem[];
  setVisibleOrder: (fromIndex: number, toIndex: number) => void;
  exchangeOverflowItem: (overflowId: AdminNavId, visibleIndex: number) => void;
  reset: () => void;
} {
  const [layout, setLayout] = useState<AdminSidebarLayout>(() => readLayout(items, enabled));

  useEffect(() => {
    const normalized = normalizeAdminSidebarLayout(layout, items);
    if (layoutsEqual(layout, normalized)) return;

    setLayout(normalized);
    if (enabled) writeLayout(normalized);
  }, [items, enabled, layout]);

  const updateLayout = (next: AdminSidebarLayout) => {
    setLayout(next);
    if (enabled) writeLayout(next);
  };

  const setVisibleOrder = (fromIndex: number, toIndex: number) => {
    const next = reorderVisibleAdminSidebarItem(layout, fromIndex, toIndex);
    if (!layoutsEqual(layout, next)) updateLayout(next);
  };

  const exchangeOverflowItem = (overflowId: AdminNavId, visibleIndex: number) => {
    const next = exchangeAdminSidebarItem(layout, overflowId, visibleIndex);
    if (!layoutsEqual(layout, next)) updateLayout(next);
  };

  const reset = () => {
    const next = createDefaultAdminSidebarLayout(items);
    if (!layoutsEqual(layout, next)) updateLayout(next);
  };

  const itemById = new Map(items.map((item) => [item.id, item]));
  const overflowItems = layout.overflowOrder.flatMap((id) => {
    const item = itemById.get(id);
    return item == null ? [] : [item];
  });

  return { layout, overflowItems, setVisibleOrder, exchangeOverflowItem, reset };
}
