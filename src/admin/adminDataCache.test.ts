import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./api', () => ({
  adminListTours: vi.fn(),
  adminListDepartures: vi.fn(),
  adminListPublishQueue: vi.fn(),
}));

import {
  clearAdminDataCache,
  getAdminTours,
  invalidateAdminTours,
  peekAdminTours,
  refreshAdminTours,
} from './adminDataCache';
import { adminListTours } from './api';

const tours = [
  {
    id: 'winter-1',
    title: 'Изюбриная',
    season: 'winter' as const,
    status: 'active' as const,
    published: true,
    slug: 'izubrinaya',
    imageUrl: null,
    ready: true,
    readyCount: 5,
    readyTotal: 5,
  },
];

describe('adminDataCache', () => {
  beforeEach(() => {
    clearAdminDataCache();
    vi.clearAllMocks();
  });

  it('deduplicates concurrent tour reads and retains the last successful value', async () => {
    vi.mocked(adminListTours).mockResolvedValue(tours);

    const [first, second] = await Promise.all([getAdminTours(), getAdminTours()]);

    expect(first).toEqual(tours);
    expect(second).toEqual(tours);
    expect(adminListTours).toHaveBeenCalledTimes(1);
    expect(peekAdminTours()).toEqual(tours);
  });

  it('keeps cached tours visible while a background refresh is pending', async () => {
    vi.mocked(adminListTours).mockResolvedValueOnce(tours);
    await getAdminTours();

    let resolveRefresh: ((value: typeof tours) => void) | undefined;
    vi.mocked(adminListTours).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const refresh = refreshAdminTours();

    expect(peekAdminTours()).toEqual(tours);

    resolveRefresh?.(tours);
    await expect(refresh).resolves.toEqual(tours);
  });

  it('после invalidate не отдаёт устаревший список туров', async () => {
    vi.mocked(adminListTours).mockResolvedValueOnce(tours);
    await getAdminTours();
    invalidateAdminTours();
    expect(peekAdminTours()).toBeUndefined();

    const published = [{ ...tours[0], status: 'hidden' as const, publishedStatus: 'hidden' as const }];
    vi.mocked(adminListTours).mockResolvedValueOnce(published);
    await expect(getAdminTours()).resolves.toEqual(published);
    expect(peekAdminTours()).toEqual(published);
  });

  it('после invalidate не записывает в кэш ответ, который начался до сброса', async () => {
    let resolveStale: ((value: typeof tours) => void) | undefined;
    vi.mocked(adminListTours).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveStale = resolve;
        }),
    );

    const staleRead = getAdminTours();
    invalidateAdminTours();

    const published = [{ ...tours[0], publishedStatus: 'hidden' as const, status: 'hidden' as const }];
    vi.mocked(adminListTours).mockResolvedValueOnce(published);
    const freshRead = getAdminTours();

    resolveStale?.(tours);
    await expect(staleRead).resolves.toEqual(tours);
    await expect(freshRead).resolves.toEqual(published);
    expect(peekAdminTours()).toEqual(published);
  });
});
