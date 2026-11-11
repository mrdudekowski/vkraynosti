import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveCatalogSource } from './lib/catalogSource.mjs';
import { syncCatalog } from './sync-catalog-from-cdn.mjs';
import { createPublicSnapshotRelease } from '../src/cms/publicSnapshotRelease.ts';

const siteSeoDocument = {
  kind: 'seo',
  schemaVersion: 1,
  pages: ['home', 'winter', 'spring', 'summer', 'fall', 'privacy'].map((key) => ({
    key,
    path: key === 'home' ? '/' : key === 'privacy' ? '/privacy/' : `/tours/${key}/`,
    title: `${key} title`,
    description: `${key} description`,
    h1: `${key} heading`,
  })),
};

const cmsTour = {
  id: 'fall-1', slug: 'test', season: 'fall', status: 'active', title: 'Test tour',
  subtitle: '', heroPhrase: '', description: 'Tour description', duration: '1 день', durationDays: 1,
  difficulty: 'Easy', price: '5000 ₽', program: [], included: [], coverAssetId: null,
  prefaceAssetId: null, assets: [], bento: { blocks: [] }, legacyGalleryVariant: null,
};

async function makeBakeRelease() {
  return createPublicSnapshotRelease({
    schemaVersion: 1,
    tours: { schemaVersion: 1, tours: [cmsTour] },
    toursList: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      tours: [{ id: cmsTour.id, title: cmsTour.title, priceRub: 5000, durationType: 'однодневный', publicationStatus: 'active' }],
    },
    schedule: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] },
    siteContent: { seo: siteSeoDocument },
    stills: [],
  }, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 's3' });
}

describe('resolveCatalogSource', () => {
  it('refuses unversioned CMS CDN packages as a deployment snapshot', () => {
    expect(() => resolveCatalogSource({
      VITE_SITE_URL: 'https://preview.example.test',
      VITE_CMS_S3_BASE_URL: 'https://cdn.example.test/cms/',
      VITE_PUBLIC_S3_BASE_URL: 'https://cdn.example.test/public',
    })).toThrow(/CMS_BAKE_URL and CMS_DEPLOY_SECRET/);
  });

  it('keeps the legacy CDN catalog when CMS is not configured', () => {
    expect(
      resolveCatalogSource({
        VITE_SITE_URL: 'https://site.example.test',
        VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.test/public/',
      }),
    ).toEqual({
      kind: 'public',
      toursListUrl: 'https://cdn.example.test/public/tour-schedule/tours_list.json',
      scheduleUrl: 'https://cdn.example.test/public/tour-schedule/schedule.json',
    });
  });

  it('refuses a production build that cannot read CMS tour slugs', () => {
    expect(() => resolveCatalogSource({
      VITE_SITE_URL: 'https://vkraynosti.ru',
      VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.test/public/',
    })).toThrow(/CMS_BAKE_URL/);
  });

  it('uses the production-domain default when VITE_SITE_URL is omitted', () => {
    expect(() => resolveCatalogSource({
      VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.test/public/',
    })).toThrow(/CMS_BAKE_URL/);
  });

  it('uses the CMS package for the production domain when configured', () => {
    expect(() => resolveCatalogSource({
      VITE_SITE_URL: 'https://www.vkraynosti.ru/',
      VITE_CMS_S3_BASE_URL: 'https://cdn.example.test/cms/',
      VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.test/public/',
    })).toThrow(/CMS_BAKE_URL/);
  });

  it('requires a deploy secret when the authenticated bake URL is set', () => {
    expect(() => resolveCatalogSource({ CMS_BAKE_URL: 'https://cms.test' })).toThrow(/CMS_DEPLOY_SECRET/);
  });

  it('returns fixtures when neither source is configured', () => {
    expect(resolveCatalogSource({ VITE_SITE_URL: 'https://site.example.test' })).toBeNull();
  });

  it('prefers the authenticated bake API over CDN packages', () => {
    expect(
      resolveCatalogSource({
        CMS_BAKE_URL: 'https://cms.test/',
        CMS_DEPLOY_SECRET: 'deploy-secret',
        VITE_CMS_S3_BASE_URL: 'https://cdn.example.test/cms/',
      }),
    ).toEqual({
      kind: 'bakeApi',
      bakeUrl: 'https://cms.test/api/cms/internal/bake',
      deploySecret: 'deploy-secret',
    });
  });
});

describe('syncCatalog', () => {
  it('does not produce a release from independently mirrored CMS files', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    try {
      await expect(syncCatalog({
        root,
        env: { VITE_SITE_URL: 'https://preview.example.test', VITE_CMS_S3_BASE_URL: 'https://cms.test' },
      })).rejects.toThrow(/CMS_BAKE_URL and CMS_DEPLOY_SECRET/);
      await expect(readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails closed when a configured CMS package cannot be fetched', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const fetchImpl = async (url) => ({ ok: url.endsWith('/tours.json'), status: 404, text: async () => '{"schemaVersion":1,"tours":[]}' });
    try {
      await expect(syncCatalog({ root, env: { VITE_SITE_URL: 'https://preview.example.test', VITE_CMS_S3_BASE_URL: 'https://cms.test' }, fetchImpl })).rejects.toThrow(/CMS_BAKE_URL and CMS_DEPLOY_SECRET/);
      await expect(readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('writes a validated release from the bake API even when the CDN returns 403', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const release = await makeBakeRelease();
    const payload = { ...release.payload, payload: release.payload, manifest: release.manifest };
    const renamedPaths = [];
    const fetchImpl = async (url) => {
      if (String(url).includes('/api/cms/internal/bake')) {
        return {
          ok: true,
          status: 200,
          json: async () => payload,
          text: async () => JSON.stringify(payload),
        };
      }
      return { ok: false, status: 403, text: async () => '', json: async () => ({}) };
    };
    try {
      await syncCatalog({
        root,
        env: {
          CMS_BAKE_URL: 'https://cms.test',
          CMS_DEPLOY_SECRET: 'deploy-secret',
          VITE_CMS_S3_BASE_URL: 'https://cdn.example.test/cms',
        },
        fetchImpl,
        fileSystem: {
          async rename(from, to) {
            renamedPaths.push(to);
            return rename(from, to);
          },
        },
      });
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8'))).toEqual({
        kind: 'cms',
        releaseId: release.manifest.releaseId,
        sha256: release.manifest.sha256,
        seoRevision: release.manifest.seoRevision,
        generatedAt: release.manifest.generatedAt,
      });
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/release.json'), 'utf8'))).toMatchObject({ manifest: release.manifest });
      expect(renamedPaths.at(-1)).toBe(resolve(root, 'public/data/cms/build-source.json'));
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tours.json'), 'utf8')).tours[0].id).toBe('fall-1');
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tour-schedule/tours_list.json'), 'utf8')).tours[0].id).toBe('fall-1');
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/site-seo/document.json'), 'utf8'))).toEqual(siteSeoDocument);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects a bake response with no release manifest before writing the build marker', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const release = await makeBakeRelease();
    const payload = { ...release.payload };
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => payload });
    try {
      await expect(syncCatalog({ root, env: { CMS_BAKE_URL: 'https://cms.test', CMS_DEPLOY_SECRET: 'deploy-secret' }, fetchImpl }))
        .rejects.toThrow();
      await expect(readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('rejects a release hash mismatch and leaves the old marker untouched', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    await mkdir(resolve(root, 'public/data/cms'), { recursive: true });
    await writeFile(resolve(root, 'public/data/cms/build-source.json'), '{"kind":"old"}\n');
    const release = await makeBakeRelease();
    const payload = {
      ...release.payload,
      payload: release.payload,
      manifest: { ...release.manifest, sha256: '0'.repeat(64) },
    };
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => payload });
    try {
      await expect(syncCatalog({ root, env: { CMS_BAKE_URL: 'https://cms.test', CMS_DEPLOY_SECRET: 'deploy-secret' }, fetchImpl }))
        .rejects.toThrow();
      expect(await readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8')).toBe('{"kind":"old"}\n');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not write a new build marker when payload writing fails', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const release = await makeBakeRelease();
    const payload = { ...release.payload, payload: release.payload, manifest: release.manifest };
    const fetchImpl = async () => ({ ok: true, status: 200, json: async () => payload });
    try {
      await expect(syncCatalog({
        root,
        env: { CMS_BAKE_URL: 'https://cms.test', CMS_DEPLOY_SECRET: 'deploy-secret' },
        fetchImpl,
        fileSystem: {
          async writeFile(path, contents, encoding) {
            if (String(path).replaceAll('\\', '/').includes('/site-seo/document.json.tmp-')) throw new Error('simulated write failure');
            return writeFile(path, contents, encoding);
          },
        },
      })).rejects.toThrow('simulated write failure');
      await expect(readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
