import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminNavId, AdminNavItem } from '../constants/nav';
import { createDefaultAdminSidebarLayout } from '../adminSidebarLayout';
import {
  ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY,
  useAdminSidebarLayout,
} from './useAdminSidebarLayout';

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
] as const;

const makeItems = (ids: readonly string[] = fixtureIds): readonly AdminNavItem[] =>
  ids.map((id) => ({
    id,
    to: `/${id}`,
    label: id,
    icon: (() => null) as unknown as AdminNavItem['icon'],
    isActive: () => false,
  })) as unknown as readonly AdminNavItem[];

describe('useAdminSidebarLayout', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads and normalizes a valid saved layout', () => {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY,
      JSON.stringify({
        visibleOrder: ['analytics', 'dashboard'],
        overflowOrder: ['tours'],
      }),
    );

    const { result } = renderHook(() => useAdminSidebarLayout(makeItems(), true));

    expect(result.current.layout).toEqual({
      visibleOrder: ['analytics', 'dashboard', ...fixtureIds.slice(1, 7)],
      overflowOrder: ['reports'],
    });
    expect(result.current.overflowItems.map(({ id }) => id)).toEqual(['reports']);
  });

  it('falls back to the canonical layout for malformed JSON', () => {
    window.localStorage.setItem(ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY, '{not-json');

    const { result } = renderHook(() => useAdminSidebarLayout(makeItems(), true));

    expect(result.current.layout).toEqual(createDefaultAdminSidebarLayout(makeItems()));
  });

  it('loads persisted layout when enabled changes after mount', () => {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY,
      JSON.stringify({
        visibleOrder: ['analytics', 'dashboard'],
        overflowOrder: ['tours'],
      }),
    );

    const { result, rerender } = renderHook(
      ({ enabled }) => useAdminSidebarLayout(makeItems(), enabled),
      { initialProps: { enabled: false } },
    );

    expect(result.current.layout).toEqual(createDefaultAdminSidebarLayout(makeItems()));

    rerender({ enabled: true });

    expect(result.current.layout).toEqual({
      visibleOrder: ['analytics', 'dashboard', ...fixtureIds.slice(1, 7)],
      overflowOrder: ['reports'],
    });
  });

  it('removes forbidden IDs and appends newly permitted IDs canonically', () => {
    window.localStorage.setItem(
      ADMIN_SIDEBAR_LAYOUT_STORAGE_KEY,
      JSON.stringify({
        visibleOrder: ['reports', 'dashboard', 'missing'],
        overflowOrder: ['tours', 'users'],
      }),
    );

    const permittedItems = makeItems(['dashboard', 'tours', 'schedule', 'inbox', 'users', 'leads', 'site']);
    const { result, rerender } = renderHook(
      ({ items }) => useAdminSidebarLayout(items, true),
      { initialProps: { items: permittedItems } },
    );

    expect([...result.current.layout.visibleOrder, ...result.current.layout.overflowOrder]).toEqual([
      'dashboard',
      'tours',
      'users',
      'schedule',
      'inbox',
      'leads',
      'site',
    ]);

    rerender({ items: makeItems() });
    expect([...result.current.layout.visibleOrder, ...result.current.layout.overflowOrder]).toEqual([
      'dashboard',
      'tours',
      'users',
      'schedule',
      'inbox',
      'leads',
      'site',
      'reports',
      'analytics',
    ]);
  });

  it('does not write during initialization but writes after completed actions', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderHook(() => useAdminSidebarLayout(makeItems(), true));
    expect(setItemSpy).not.toHaveBeenCalled();

    const { result } = renderHook(() => useAdminSidebarLayout(makeItems(), true));
    act(() => result.current.setVisibleOrder(0, 2));
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItemSpy.mock.calls[0][1])).toEqual({
      visibleOrder: ['tours', 'schedule', 'dashboard', 'inbox', 'users', 'leads', 'site', 'reports'],
      overflowOrder: ['analytics'],
    });

    act(() => result.current.exchangeOverflowItem('analytics' as AdminNavId, 1));
    expect(setItemSpy).toHaveBeenCalledTimes(2);
    act(() => result.current.reset());
    expect(setItemSpy).toHaveBeenCalledTimes(3);
  });

  it('persists a meaningful normalization when permitted items change', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const initialItems = makeItems(fixtureIds.slice(0, 8));
    const { rerender } = renderHook(
      ({ items }) => useAdminSidebarLayout(items, true),
      { initialProps: { items: initialItems } },
    );

    expect(setItemSpy).not.toHaveBeenCalled();
    rerender({ items: makeItems(fixtureIds) });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItemSpy.mock.calls[0][1])).toEqual({
      visibleOrder: [...fixtureIds.slice(0, 8)],
      overflowOrder: ['analytics'],
    });
  });

  it('persists permission-removal normalization when permitted items change', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { rerender } = renderHook(
      ({ items }) => useAdminSidebarLayout(items, true),
      { initialProps: { items: makeItems() } },
    );

    expect(setItemSpy).not.toHaveBeenCalled();
    rerender({ items: makeItems(fixtureIds.slice(0, 8)) });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(setItemSpy.mock.calls[0][1])).toEqual({
      visibleOrder: [...fixtureIds.slice(0, 8)],
      overflowOrder: [],
    });
  });

  it('does not write for no-op reorder, invalid exchange, or no-op reset', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useAdminSidebarLayout(makeItems(), true));

    act(() => result.current.setVisibleOrder(0, 0));
    act(() => result.current.exchangeOverflowItem('analytics' as AdminNavId, -1));
    act(() => result.current.reset());

    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('survives localStorage read failures', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('read failed');
    });

    const { result } = renderHook(() => useAdminSidebarLayout(makeItems(), true));

    expect(result.current.layout).toEqual(createDefaultAdminSidebarLayout(makeItems()));
  });

  it('survives localStorage write failures', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failed');
    });

    const { result } = renderHook(() => useAdminSidebarLayout(makeItems(), true));

    expect(() => {
      act(() => result.current.setVisibleOrder(0, 1));
    }).not.toThrow();
    expect(result.current.layout.visibleOrder.slice(0, 2)).toEqual(['tours', 'dashboard']);
  });
});
