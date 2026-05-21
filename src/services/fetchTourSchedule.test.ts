import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTourSchedule, TourScheduleFetchError } from './fetchTourSchedule';

describe('fetchTourSchedule', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('parses array response and builds prices from events', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [
        {
          date: '2026-05-09',
          tourId: 'spring-3',
          durationType: 'однодневный',
          priceRub: 6000,
          seats: 8,
          status: 'open',
          comment: null,
        },
      ],
    } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0]?.tourId).toBe('spring-3');
    expect(payload.catalogPrices).toEqual({ 'spring-3': 6000 });
  });

  it('parses wrapped response with catalog prices', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            date: '2026-05-09',
            tourId: 'spring-3',
            durationType: 'однодневный',
            priceRub: 6000,
            seats: 8,
            status: 'open',
            comment: null,
          },
        ],
        prices: {
          'spring-3': 6500,
          'spring-1': 6000,
        },
      }),
    } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.events).toHaveLength(1);
    expect(payload.catalogPrices).toEqual({
      'spring-3': 6500,
      'spring-1': 6000,
    });
  });

  it('throws parse error on invalid payload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    } as Response);

    await expect(fetchTourSchedule()).rejects.toBeInstanceOf(TourScheduleFetchError);
  });
});
