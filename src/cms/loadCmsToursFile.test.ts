import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadCmsToursFile } from './loadCmsToursFile';

const bakeFile = {
  schemaVersion: 1 as const,
  tours: [
    {
      id: 'fall-1',
      slug: 'test',
      season: 'fall' as const,
      status: 'active' as const,
      title: 'Test',
      subtitle: 's',
      heroPhrase: 'h',
      description: 'd',
      duration: '1 день',
      durationDays: 1,
      difficulty: 'Easy' as const,
      price: 'по запросу',
      program: [{ timeLabel: '04:30', description: 'Выезд' }],
      included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
      coverAssetId: 'cover',
      prefaceAssetId: null,
      assets: [
        {
          id: 'cover',
          stillUrl: '/data/cms/media/tours/fall-1/cover.webp',
          videoUrl: null,
          alt: '',
        },
      ],
      bento: { blocks: [] },
      legacyGalleryVariant: null,
    },
  ],
};

describe('loadCmsToursFile', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('loads bake JSON and does not fetch CDN', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => bakeFile,
    });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(loadCmsToursFile()).resolves.toMatchObject({ schemaVersion: 1 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toMatch(/\/data\/cms\/tours\.json$/);
    expect(String(fetchSpy.mock.calls[0]?.[0])).not.toContain('cdn.example');
  });

  it('returns null when bake is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(loadCmsToursFile()).resolves.toBeNull();
  });

  it('returns null when bake is invalid JSON shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ nope: true }),
    }));
    await expect(loadCmsToursFile()).resolves.toBeNull();
  });
});
