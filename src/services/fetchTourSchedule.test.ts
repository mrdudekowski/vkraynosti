import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTourSchedule, TourScheduleFetchError } from './fetchTourSchedule';

const ENDPOINT = 'https://example.com/tour-schedule';

describe('fetchTourSchedule', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_TOUR_SCHEDULE_ENDPOINT_URL', ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('throws not-configured when endpoint env is missing', async () => {
    vi.stubEnv('VITE_TOUR_SCHEDULE_ENDPOINT_URL', '');
    await expect(fetchTourSchedule()).rejects.toMatchObject({
      code: 'not-configured',
    } satisfies Partial<TourScheduleFetchError>);
  });

  it('parses wrapped response with events and publicationStatuses', async () => {
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
        publicationStatuses: {
          'spring-3': 'active',
        },
      }),
    } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0]?.tourId).toBe('spring-3');
    expect(payload.catalogPrices).toEqual({ 'spring-3': 6000 });
    expect(payload.catalogDurationTypes).toEqual({ 'spring-3': 'однодневный' });
    expect(payload.catalogPublicationStatuses).toEqual({ 'spring-3': 'active' });
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
        publicationStatuses: {},
      }),
    } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.events).toHaveLength(1);
    expect(payload.catalogPrices).toEqual({
      'spring-3': 6500,
      'spring-1': 6000,
    });
  });

  it('parses wrapped response with catalog duration types', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [
          {
            date: '2026-05-09',
            tourId: 'spring-3',
            durationType: 'многодневный',
            priceRub: 6000,
            seats: 8,
            status: 'open',
            comment: null,
          },
        ],
        durationTypes: {
          'spring-3': 'однодневный',
          'summer-7': 'многодневный',
        },
        publicationStatuses: {},
      }),
    } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.catalogDurationTypes).toEqual({
      'spring-3': 'однодневный',
      'summer-7': 'многодневный',
    });
  });

  it('parses wrapped response with publication statuses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [],
        publicationStatuses: {
          'summer-13': 'in_development',
          'summer-18': 'hidden',
        },
      }),
    } as Response);

    const payload = await fetchTourSchedule();
    expect(payload.catalogPublicationStatuses).toEqual({
      'summer-13': 'in_development',
      'summer-18': 'hidden',
    });
  });

  it('throws parse error on legacy array-only payload', async () => {
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

    await expect(fetchTourSchedule()).rejects.toMatchObject({
      code: 'parse',
    } satisfies Partial<TourScheduleFetchError>);
  });

  it('throws parse error on invalid payload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: true }),
    } as Response);

    await expect(fetchTourSchedule()).rejects.toBeInstanceOf(TourScheduleFetchError);
  });
});
