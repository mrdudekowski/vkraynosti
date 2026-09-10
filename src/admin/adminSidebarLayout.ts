import type { AdminNavId, AdminNavItem } from './constants/nav';

export const ADMIN_SIDEBAR_VISIBLE_LIMIT = 8;

export type AdminSidebarLayout = {
  visibleOrder: AdminNavId[];
  overflowOrder: AdminNavId[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isIdArray = (value: unknown): value is unknown[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const copyLayout = (layout: AdminSidebarLayout): AdminSidebarLayout => ({
  visibleOrder: [...layout.visibleOrder],
  overflowOrder: [...layout.overflowOrder],
});

const getCanonicalIds = (items: readonly AdminNavItem[]): AdminNavId[] => {
  const seen = new Set<AdminNavId>();
  const ids: AdminNavId[] = [];

  for (const { id } of items) {
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return ids;
};

export function createDefaultAdminSidebarLayout(
  items: readonly AdminNavItem[],
): AdminSidebarLayout {
  const ids = getCanonicalIds(items);
  return {
    visibleOrder: ids.slice(0, ADMIN_SIDEBAR_VISIBLE_LIMIT),
    overflowOrder: ids.slice(ADMIN_SIDEBAR_VISIBLE_LIMIT),
  };
}

export function normalizeAdminSidebarLayout(
  saved: unknown,
  items: readonly AdminNavItem[],
): AdminSidebarLayout {
  const fallback = createDefaultAdminSidebarLayout(items);
  if (!isRecord(saved) || !isIdArray(saved.visibleOrder) || !isIdArray(saved.overflowOrder)) {
    return fallback;
  }

  const canonicalIds = getCanonicalIds(items);
  const permittedIds = new Set(canonicalIds);
  const seen = new Set<AdminNavId>();
  const orderedIds: AdminNavId[] = [];

  for (const candidate of [...saved.visibleOrder, ...saved.overflowOrder]) {
    if (!permittedIds.has(candidate as AdminNavId)) continue;
    const id = candidate as AdminNavId;
    if (seen.has(id)) continue;
    seen.add(id);
    orderedIds.push(id);
  }

  for (const id of canonicalIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    orderedIds.push(id);
  }

  return {
    visibleOrder: orderedIds.slice(0, ADMIN_SIDEBAR_VISIBLE_LIMIT),
    overflowOrder: orderedIds.slice(ADMIN_SIDEBAR_VISIBLE_LIMIT),
  };
}

export function reorderVisibleAdminSidebarItem(
  layout: AdminSidebarLayout,
  fromIndex: number,
  toIndex: number,
): AdminSidebarLayout {
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    fromIndex >= layout.visibleOrder.length ||
    toIndex < 0 ||
    toIndex >= layout.visibleOrder.length
  ) {
    return copyLayout(layout);
  }

  const visibleOrder = [...layout.visibleOrder];
  const [movedId] = visibleOrder.splice(fromIndex, 1);
  visibleOrder.splice(toIndex, 0, movedId);
  return { visibleOrder, overflowOrder: [...layout.overflowOrder] };
}

export function exchangeAdminSidebarItem(
  layout: AdminSidebarLayout,
  overflowId: AdminNavId,
  visibleIndex: number,
): AdminSidebarLayout {
  if (
    !Number.isInteger(visibleIndex) ||
    visibleIndex < 0 ||
    visibleIndex >= layout.visibleOrder.length ||
    !layout.overflowOrder.includes(overflowId)
  ) {
    return copyLayout(layout);
  }

  const displacedId = layout.visibleOrder[visibleIndex];
  const visibleOrder = [...layout.visibleOrder];
  visibleOrder[visibleIndex] = overflowId;

  return {
    visibleOrder,
    overflowOrder: [...layout.overflowOrder.filter((id) => id !== overflowId), displacedId],
  };
}
