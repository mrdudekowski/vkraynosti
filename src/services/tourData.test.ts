import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTourSchedulePayload, loadToursList } from './tourData';

describe('tourData service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_PUBLIC_S3_BASE_URL', 'https://cdn.example.test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('loads tours_list.json', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        schemaVersion: 1,
        generatedAt: '2026-06-08T00:00:00.000Z',
        tours: [
          {
            id: 'summer-3',
            title: 'Остров',
            priceRub: 8500,
            durationType: 'однодневный',
            publicationStatus: 'active',
          },
        ],
      }),
    } as Response);

    const payload = await loadToursList();
    expect(payload.tours).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://cdn.example.test/tour-schedule/tours_list.json',
      { cache: 'no-store' },
    );
  });

  it('merges tours and schedule payloads', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          schemaVersion: 1,
          generatedAt: '2026-06-08T00:00:00.000Z',
          tours: [
            {
              id: 'summer-3',
              title: 'Остров',
              priceRub: 8500,
              durationType: 'однодневный',
              publicationStatus: 'active',
            },
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          schemaVersion: 1,
          generatedAt: '2026-06-08T00:00:00.000Z',
          events: [
            {
              date: '2026-07-18',
              tourId: 'summer-3',
              seats: 12,
              status: 'open',
              comment: null,
            },
          ],
        }),
      } as Response);

    const payload = await loadTourSchedulePayload();
    expect(payload.events).toHaveLength(1);
    expect(payload.catalogPublicationStatuses['summer-3']).toBe('active');
  });
});
