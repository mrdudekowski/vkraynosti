import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTourSchedulePayload, loadToursList } from './tourData';

describe('tourData service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_PUBLIC_S3_BASE_URL', 'https://cdn.example.test');
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('loads tours_list.json', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        kind: 'legacy',
      }),
    } as Response).mockResolvedValueOnce({
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
      '/data/cms/tour-schedule/tours_list.json',
      { cache: 'no-store' },
    );
  });

  it('merges tours and schedule payloads', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ kind: 'legacy' }),
      } as Response)
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

  it('loads the published calendar from the live CMS before using the embedded snapshot', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms/');
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith('/published/tour-schedule/tours_list.json')) {
        return {
          ok: true,
          json: async () => ({
            schemaVersion: 1,
            generatedAt: '2026-06-08T00:00:00.000Z',
            tours: [{ id: 'summer-3', title: 'Из CMS', priceRub: 8500, durationType: 'однодневный', publicationStatus: 'active' }],
          }),
        } as Response;
      }
      if (url.endsWith('/published/tour-schedule/schedule.json')) {
        return {
          ok: true,
          json: async () => ({
            schemaVersion: 1,
            generatedAt: '2026-06-08T00:00:00.000Z',
            events: [],
          }),
        } as Response;
      }
      return { ok: false, status: 503 } as Response;
    });

    const payload = await loadTourSchedulePayload();

    expect(payload.catalogPrices['summer-3']).toBe(8500);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://cdn.example/cms/published/tour-schedule/tours_list.json',
      { cache: 'no-store' },
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://cdn.example/cms/published/tour-schedule/schedule.json',
      { cache: 'no-store' },
    );
  });

  it('uses the baked snapshot when live schedule JSON cannot be loaded', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms/');
    const list = {
      schemaVersion: 1,
      generatedAt: '2026-06-08T00:00:00.000Z',
      tours: [{ id: 'summer-3', title: 'Из snapshot', priceRub: 8500, durationType: 'однодневный', publicationStatus: 'active' }],
    };
    const schedule = { schemaVersion: 1, generatedAt: '2026-06-08T00:00:00.000Z', events: [] };
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/published/tour-schedule/')) return { ok: false, status: 503 } as Response;
      if (url.endsWith('/build-source.json')) return { ok: true, json: async () => ({ kind: 'legacy' }) } as Response;
      if (url.includes('/tours_list.json')) return { ok: true, json: async () => list } as Response;
      if (url.includes('/schedule.json')) return { ok: true, json: async () => schedule } as Response;
      return { ok: false, status: 404 } as Response;
    });

    const payload = await loadTourSchedulePayload();
    expect(payload.catalogPrices['summer-3']).toBe(8500);
    expect(payload.catalogPublicationStatuses['summer-3']).toBe('active');
    expect(fetch).toHaveBeenCalledWith(
      'https://cdn.example/cms/published/tour-schedule/tours_list.json',
      { cache: 'no-store' },
    );
    expect(fetch).toHaveBeenCalledWith('/data/cms/tour-schedule/tours_list.json', { cache: 'no-store' });
  });

  it('still rejects malformed live responses before using the embedded release', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms/');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        schemaVersion: 1,
        generatedAt: '2026-06-08T00:00:00.000Z',
        tours: 'bad',
      }),
    } as Response);

    await expect(loadToursList()).rejects.toThrow();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://cdn.example/cms/published/tour-schedule/tours_list.json',
      { cache: 'no-store' },
    );
  });

  it('при CMS env не падает на прод-календарь, если снимок cms-dev не открылся', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example/vkraynosti-cms-dev/');
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(loadToursList()).rejects.toThrow();
    const urls = vi.mocked(fetch).mock.calls.map((call) => call[0]);
    expect(urls).not.toContain('https://cdn.example.test/tour-schedule/tours_list.json');
  });
});
