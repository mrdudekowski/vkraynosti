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

  it('parses array response', async () => {
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

    const events = await fetchTourSchedule();
    expect(events).toHaveLength(1);
    expect(events[0]?.tourId).toBe('spring-3');
  });

  it('parses wrapped events response', async () => {
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
      }),
    } as Response);

    const events = await fetchTourSchedule();
    expect(events).toHaveLength(1);
  });

  it('throws parse error on invalid payload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    } as Response);

    await expect(fetchTourSchedule()).rejects.toBeInstanceOf(TourScheduleFetchError);
  });
});
