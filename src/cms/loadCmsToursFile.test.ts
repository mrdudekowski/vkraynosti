import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadCmsToursFile, loadLiveCmsToursFile } from './loadCmsToursFile';

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

  it('prefers live published tours.json then falls back to bake', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const live = { ...bakeFile, tours: [{ ...bakeFile.tours[0], title: 'Live' }] };
    const fetchSpy = vi.fn(async (url: string) => {
      if (String(url).includes('published/tours.json')) {
        return { ok: true, json: async () => live };
      }
      return { ok: true, json: async () => bakeFile };
    });
    vi.stubGlobal('fetch', fetchSpy);
    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'live',
      file: { tours: [{ title: 'Live' }] },
    });
  });

  it('uses bake when live published tours.json is 403', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const fetchSpy = vi.fn(async (url: string) => {
      if (String(url).includes('published/tours.json')) {
        return { ok: false, status: 403 };
      }
      return { ok: true, json: async () => bakeFile };
    });
    vi.stubGlobal('fetch', fetchSpy);
    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'bake',
      file: { tours: [{ title: 'Test' }] },
    });
  });

  it('marks source live vs bake', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (String(url).includes('published/tours.json')) {
        return { ok: false, status: 403 };
      }
      return { ok: true, json: async () => bakeFile };
    }));
    await expect(loadCmsToursFile()).resolves.toMatchObject({ source: 'bake' });
  });

  it('loadLiveCmsToursFile returns null on 403 and the live file on 200', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const live = { ...bakeFile, tours: [{ ...bakeFile.tours[0], title: 'Live' }] };
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })));
    await expect(loadLiveCmsToursFile()).resolves.toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => live })));
    await expect(loadLiveCmsToursFile()).resolves.toMatchObject({
      tours: [{ title: 'Live' }],
    });
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
