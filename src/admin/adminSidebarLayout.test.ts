import { describe, expect, it } from 'vitest';
import type { AdminNavId, AdminNavItem } from './constants/nav';
import {
  ADMIN_SIDEBAR_VISIBLE_LIMIT,
  createDefaultAdminSidebarLayout,
  exchangeAdminSidebarItem,
  normalizeAdminSidebarLayout,
  reorderVisibleAdminSidebarItem,
} from './adminSidebarLayout';

const fixtureIds = [
  'dashboard',
  'tours',
  'schedule',
  'inbox',
  'users',
  'leads',
  'site',
  'reports',
  'analytics',
  'settings',
] as const;

const fixtureItems = fixtureIds.map((id) => ({
  id,
  to: `/${id}`,
  label: id,
  icon: (() => null) as unknown as AdminNavItem['icon'],
  isActive: () => false,
})) as unknown as readonly AdminNavItem[];

const ids = fixtureIds as unknown as AdminNavId[];

describe('adminSidebarLayout', () => {
  it('defaults to eight visible items and puts the remainder in overflow', () => {
    expect(ADMIN_SIDEBAR_VISIBLE_LIMIT).toBe(8);
    expect(createDefaultAdminSidebarLayout(fixtureItems)).toEqual({
      visibleOrder: ids.slice(0, 8),
      overflowOrder: ids.slice(8),
    });
  });

  it('normalizes malformed saved layout, duplicates, unknown IDs, and permission removal', () => {
    const saved = {
      visibleOrder: ['analytics', 'missing', 'analytics', 'dashboard', 'settings'],
      overflowOrder: ['tours', 'dashboard', 'missing', 'settings'],
    };
    const removedIds = new Set<string>(['users', 'reports']);
    const permitted = fixtureItems.filter(({ id }) => !removedIds.has(id));

    const result = normalizeAdminSidebarLayout(saved, permitted);

    expect(result).toEqual({
      visibleOrder: ['analytics', 'dashboard', 'settings', 'tours', 'schedule', 'inbox', 'leads', 'site'],
      overflowOrder: [],
    });
    expect([...result.visibleOrder, ...result.overflowOrder].sort()).toEqual(
      permitted.map(({ id }) => id).sort(),
    );
  });

  it('fills missing IDs canonically and caps the visible list at eight', () => {
    const result = normalizeAdminSidebarLayout(
      { visibleOrder: ['settings'], overflowOrder: ['analytics'] },
      fixtureItems,
    );

    expect(result.visibleOrder).toEqual(['settings', 'analytics', ...ids.slice(0, 6)]);
    expect(result.overflowOrder).toEqual(['site', 'reports']);
  });

  it('appends newly permitted IDs canonically and keeps the exact-once union', () => {
    const previouslyPermitted = fixtureItems.slice(0, 9);
    const saved = {
      visibleOrder: ids.slice(0, 8),
      overflowOrder: [ids[8]],
    };

    const result = normalizeAdminSidebarLayout(saved, fixtureItems);

    expect(result).toEqual({
      visibleOrder: ids.slice(0, 8),
      overflowOrder: [ids[8], ids[9]],
    });
    expect([...result.visibleOrder, ...result.overflowOrder]).toEqual([...ids]);
    expect(
      normalizeAdminSidebarLayout(
        { visibleOrder: ids.slice(0, 8), overflowOrder: [ids[8]] },
        [...previouslyPermitted, fixtureItems[9]],
      ),
    ).toEqual(result);
  });

  it('deduplicates permitted IDs, including malformed-save fallback', () => {
    const duplicatedItems = [...fixtureItems, fixtureItems[0], fixtureItems[8]];

    expect(createDefaultAdminSidebarLayout(duplicatedItems)).toEqual(
      createDefaultAdminSidebarLayout(fixtureItems),
    );
    expect(normalizeAdminSidebarLayout(null, duplicatedItems)).toEqual(
      createDefaultAdminSidebarLayout(fixtureItems),
    );
  });

  it('treats malformed saved values as an empty layout', () => {
    expect(normalizeAdminSidebarLayout(null, fixtureItems)).toEqual(
      createDefaultAdminSidebarLayout(fixtureItems),
    );
    expect(normalizeAdminSidebarLayout({ visibleOrder: 'bad' }, fixtureItems)).toEqual(
      createDefaultAdminSidebarLayout(fixtureItems),
    );
  });

  it('reorders visible items without changing the union', () => {
    const layout = createDefaultAdminSidebarLayout(fixtureItems);

    expect(reorderVisibleAdminSidebarItem(layout, 0, 3)).toEqual({
      visibleOrder: [ids[1], ids[2], ids[3], ids[0], ...ids.slice(4, 8)],
      overflowOrder: ids.slice(8),
    });
    expect(reorderVisibleAdminSidebarItem(layout, -1, 2)).toEqual(layout);
    expect(reorderVisibleAdminSidebarItem(layout, 0, 8)).toEqual(layout);
    expect(reorderVisibleAdminSidebarItem(layout, Number.NaN, 2)).toEqual(layout);
    expect(reorderVisibleAdminSidebarItem(layout, 0, Number.POSITIVE_INFINITY)).toEqual(layout);
    expect(reorderVisibleAdminSidebarItem(layout, 0, 1.5)).toEqual(layout);
    expect(reorderVisibleAdminSidebarItem(layout, 1.5, 2)).toEqual(layout);
  });

  it('exchanges an overflow item with the visible target and preserves overflow order', () => {
    const layout = createDefaultAdminSidebarLayout(fixtureItems);

    expect(exchangeAdminSidebarItem(layout, ids[8], 2)).toEqual({
      visibleOrder: [...ids.slice(0, 2), ids[8], ...ids.slice(3, 8)],
      overflowOrder: [ids[9], ids[2]],
    });
    expect(exchangeAdminSidebarItem(layout, 'missing' as AdminNavId, 2)).toEqual(layout);
    expect(exchangeAdminSidebarItem(layout, ids[8], -1)).toEqual(layout);
    expect(exchangeAdminSidebarItem(layout, ids[8], 8)).toEqual(layout);
    expect(exchangeAdminSidebarItem(layout, ids[8], Number.NaN)).toEqual(layout);
    expect(exchangeAdminSidebarItem(layout, ids[8], Number.POSITIVE_INFINITY)).toEqual(layout);
    expect(exchangeAdminSidebarItem(layout, ids[8], 1.5)).toEqual(layout);
  });

  it('returns a canonical reset layout', () => {
    const layout = {
      visibleOrder: [ids[7], ...ids.slice(0, 7)],
      overflowOrder: [ids[8], ids[9]],
    };
    expect(createDefaultAdminSidebarLayout(fixtureItems)).not.toEqual(layout);
    expect(createDefaultAdminSidebarLayout(fixtureItems)).toEqual({
      visibleOrder: ids.slice(0, 8),
      overflowOrder: ids.slice(8),
    });
  });
});
