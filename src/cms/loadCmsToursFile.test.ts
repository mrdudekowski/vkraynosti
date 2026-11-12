import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPublicSnapshotRelease } from './publicSnapshotRelease';
import { createDefaultSiteSeoDocument } from './siteSeoDocument';
import { loadCmsToursFile } from './loadCmsToursFile';

const tour = {
  id: 'fall-1', slug: 'test', season: 'fall', status: 'active', title: 'Baked title',
  subtitle: 'Subtitle', heroPhrase: 'Hero', description: 'Description', duration: '1 день', durationDays: 1,
  difficulty: 'Easy', price: 'по запросу', program: [{ timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }], coverAssetId: 'cover', prefaceAssetId: null,
  assets: [{ id: 'cover', stillUrl: 'https://cdn.example/media/tours/fall-1/cover.webp', videoUrl: null, alt: '' }],
  bento: { blocks: [] }, legacyGalleryVariant: null,
};
const bakedTour = {
  ...tour,
  assets: [{ ...tour.assets[0], stillUrl: '/data/cms/media/tours/fall-1/cover.webp' }],
};
const bakeFile = { schemaVersion: 1, tours: [bakedTour] };

async function createResponseSet() {
  const release = await createPublicSnapshotRelease({
    schemaVersion: 1,
    tours: { schemaVersion: 1, tours: [tour] },
    toursList: {
      schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z',
      tours: [{ id: tour.id, title: tour.title, priceRub: null, durationType: 'однодневный', publicationStatus: 'active' }],
    },
    schedule: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] },
    siteContent: { seo: createDefaultSiteSeoDocument() },
    stills: [],
  }, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'test' });
  return {
    marker: {
      kind: 'cms', releaseId: release.manifest.releaseId, sha256: release.manifest.sha256,
      generatedAt: release.manifest.generatedAt,
    },
    release,
    tours: bakeFile,
  };
}

function stubBakeResponses(responseSet: Awaited<ReturnType<typeof createResponseSet>>) {
  const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const parsed = new URL(url, 'https://local.invalid');
    if (parsed.origin !== 'https://local.invalid') {
      return { ok: false, status: 503, json: async () => null };
    }
    const pathname = parsed.pathname;
    const value = pathname.endsWith('/build-source.json') ? responseSet.marker
      : pathname.endsWith('/release.json') ? responseSet.release
        : pathname.endsWith('/tours.json') ? responseSet.tours
          : null;
    return value == null
      ? { ok: false, status: 404, json: async () => null }
      : { ok: true, json: async () => value };
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

describe('loadCmsToursFile', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('uses a valid live catalog even when it differs from the deployed SEO release', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const liveFile = { schemaVersion: 1, tours: [{ ...tour, title: 'Published live title' }] };
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === 'https://cdn.example/cms/published/tours.json') {
        return { ok: true, json: async () => liveFile };
      }
      return { ok: false, status: 404, json: async () => null };
    });
    vi.stubGlobal('fetch', fetchSpy);

    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'live', file: { tours: [{ title: 'Published live title' }] },
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('loads the embedded catalog only when its release marker and hash match', async () => {
    const responses = await createResponseSet();
    const fetchSpy = stubBakeResponses(responses);

    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'bake', file: { tours: [{ title: 'Baked title' }] },
    });
    const urls = fetchSpy.mock.calls.map(([url]) => new URL(String(url), 'https://local.invalid'));
    expect(urls.map(({ pathname }) => pathname)).toEqual([
      '/data/cms/build-source.json', '/data/cms/release.json', '/data/cms/tours.json',
    ]);
    expect(urls[2].searchParams.get('releaseId')).toBe(responses.release.manifest.releaseId);
  });

  it('rejects a different release marker even when a CMS CDN is configured', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const responses = await createResponseSet();
    responses.marker = { ...responses.marker, sha256: '0'.repeat(64) };
    stubBakeResponses(responses);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(loadCmsToursFile()).resolves.toBeNull();
  });

  it('uses the embedded release if the baked catalog differs from that release', async () => {
    const responses = await createResponseSet();
    responses.tours = { ...bakeFile, tours: [{ ...bakedTour, slug: 'different-route' }] };
    stubBakeResponses(responses);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'snapshot', file: { tours: [{ title: 'Baked title' }] },
    });
  });

  it('uses the embedded release when the published catalog cannot be fetched', async () => {
    const responses = await createResponseSet();
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const pathname = new URL(String(input), 'https://local.invalid').pathname;
      const value = pathname.endsWith('/build-source.json') ? responses.marker
        : pathname.endsWith('/release.json') ? responses.release
          : null;
      return value == null
        ? { ok: false, status: 503, json: async () => null }
        : { ok: true, json: async () => value };
    }));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'snapshot', file: { tours: [{ title: 'Baked title' }] },
    });
  });

  it('returns null when the build marker is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(loadCmsToursFile()).resolves.toBeNull();
  });
});
