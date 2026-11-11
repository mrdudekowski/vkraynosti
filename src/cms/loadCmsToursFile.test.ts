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
    const value = url.endsWith('/build-source.json') ? responseSet.marker
      : url.endsWith('/release.json') ? responseSet.release
        : url.endsWith('/tours.json') ? responseSet.tours
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

  it('loads the embedded catalog only when its release marker and hash match', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const responses = await createResponseSet();
    const fetchSpy = stubBakeResponses(responses);

    await expect(loadCmsToursFile()).resolves.toMatchObject({
      source: 'bake', file: { tours: [{ title: 'Baked title' }] },
    });
    expect(fetchSpy.mock.calls.map(([url]) => String(url))).toEqual([
      '/data/cms/build-source.json', '/data/cms/release.json', '/data/cms/tours.json',
    ]);
  });

  it('rejects a different release marker even when a CMS CDN is configured', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.example/cms');
    const responses = await createResponseSet();
    responses.marker = { ...responses.marker, sha256: '0'.repeat(64) };
    stubBakeResponses(responses);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(loadCmsToursFile()).resolves.toBeNull();
  });

  it('rejects a baked catalog whose route differs from its release', async () => {
    const responses = await createResponseSet();
    responses.tours = { ...bakeFile, tours: [{ ...bakedTour, slug: 'different-route' }] };
    stubBakeResponses(responses);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(loadCmsToursFile()).resolves.toBeNull();
  });

  it('returns null when the build marker is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(loadCmsToursFile()).resolves.toBeNull();
  });
});
