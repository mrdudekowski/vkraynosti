import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTourSchedule, TourScheduleFetchError } from './fetchTourSchedule';

const BASE = 'https://example.com/data';

const toursList = {
  schemaVersion: 1,
  generatedAt: '2026-06-08T00:00:00.000Z',
  tours: [
    {
      id: 'spring-3',
      title: 'Тур',
      priceRub: 6000,
      durationType: 'однодневный',
      publicationStatus: 'active',
    },
    {
      id: 'spring-1',
      title: 'Другой',
      priceRub: 6000,
      durationType: 'однодневный',
      publicationStatus: 'active',
    },
  ],
};

const schedule = {
  schemaVersion: 1,
  generatedAt: '2026-06-08T00:00:00.000Z',
  events: [
    {
      date: '2026-05-09',
      tourId: 'spring-3',
      seats: 8,
      status: 'open',
      comment: null,
    },
  ],
};

describe('fetchTourSchedule', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_PUBLIC_S3_BASE_URL', BASE);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('parses merged payload from tours_list and schedule', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => toursList } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => schedule } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0]?.tourId).toBe('spring-3');
    expect(payload.catalogPrices).toEqual({ 'spring-3': 6000, 'spring-1': 6000 });
    expect(payload.catalogDurationTypes).toEqual({
      'spring-3': 'однодневный',
      'spring-1': 'однодневный',
    });
    expect(payload.catalogPublicationStatuses).toEqual({
      'spring-3': 'active',
      'spring-1': 'active',
    });
  });

  it('throws parse error on invalid tours payload', async () => {
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('tours_list.json')) {
        return { ok: true, json: async () => ({ invalid: true }) } as Response;
      }
      return { ok: true, json: async () => schedule } as Response;
    });

    await expect(fetchTourSchedule()).rejects.toBeInstanceOf(TourScheduleFetchError);
  });
});
