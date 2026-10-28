import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveCatalogSource } from './lib/catalogSource.mjs';
import { syncCatalog } from './sync-catalog-from-cdn.mjs';

describe('resolveCatalogSource', () => {
  it('prefers published CMS packages when the CMS base is configured', () => {
    expect(
      resolveCatalogSource({
        VITE_CMS_S3_BASE_URL: 'https://cdn.example.test/cms/',
        VITE_PUBLIC_S3_BASE_URL: 'https://cdn.example.test/public',
      }),
    ).toEqual({
      kind: 'cms',
      toursUrl: 'https://cdn.example.test/cms/published/tours.json',
      toursListUrl: 'https://cdn.example.test/cms/published/tour-schedule/tours_list.json',
      scheduleUrl: 'https://cdn.example.test/cms/published/tour-schedule/schedule.json',
    });
  });

  it('keeps the legacy CDN catalog when CMS is not configured', () => {
    expect(
      resolveCatalogSource({ VITE_PUBLIC_ASSET_BASE_URL: 'https://cdn.example.test/public/' }),
    ).toEqual({
      kind: 'public',
      toursListUrl: 'https://cdn.example.test/public/tour-schedule/tours_list.json',
      scheduleUrl: 'https://cdn.example.test/public/tour-schedule/schedule.json',
    });
  });

  it('returns fixtures when neither source is configured', () => {
    expect(resolveCatalogSource({})).toBeNull();
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
  it('writes a consistent CMS build snapshot only after all packages validate', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const packages = new Map([
      ['https://cms.test/published/tours.json', { schemaVersion: 1, tours: [{ id: 'fall-1', slug: 'test', season: 'fall', status: 'active' }] }],
      ['https://cms.test/published/tour-schedule/tours_list.json', { schemaVersion: 1, tours: [{ id: 'fall-1', publicationStatus: 'active' }] }],
      ['https://cms.test/published/tour-schedule/schedule.json', { schemaVersion: 1, events: [] }],
    ]);
    const fetchImpl = async (url) => ({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(packages.get(url)),
    });

    try {
      await syncCatalog({ root, env: { VITE_CMS_S3_BASE_URL: 'https://cms.test' }, fetchImpl });
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8'))).toEqual({ kind: 'cms' });
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tours.json'), 'utf8')).tours[0].slug).toBe('test');
      expect(JSON.parse(await readFile(resolve(root, 'public/data/tour-schedule/tours_list.json'), 'utf8')).tours[0].id).toBe('fall-1');
      expect(JSON.parse(await readFile(resolve(root, 'public/data/tour-schedule/schedule.json'), 'utf8')).events).toEqual([]);
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tour-schedule/tours_list.json'), 'utf8')).tours[0].id).toBe('fall-1');
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tour-schedule/schedule.json'), 'utf8')).events).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails closed when a configured CMS package cannot be fetched', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const fetchImpl = async (url) => ({ ok: url.endsWith('/tours.json'), status: 404, text: async () => '{"schemaVersion":1,"tours":[]}' });
    try {
      await expect(syncCatalog({ root, env: { VITE_CMS_S3_BASE_URL: 'https://cms.test' }, fetchImpl })).rejects.toThrow('HTTP 404');
      await expect(readFile(resolve(root, 'public/data/cms/build-source.json'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('writes cms tours from the bake API even when the CDN returns 403', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-catalog-'));
    const payload = {
      tours: { schemaVersion: 1, tours: [{ id: 'fall-1', slug: 'test', season: 'fall', status: 'active', assets: [] }] },
      toursList: { schemaVersion: 1, tours: [{ id: 'fall-1', publicationStatus: 'active' }] },
      schedule: { schemaVersion: 1, events: [] },
      siteContent: {},
      stills: [],
    };
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
      });
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tours.json'), 'utf8')).tours[0].id).toBe('fall-1');
      expect(JSON.parse(await readFile(resolve(root, 'public/data/cms/tour-schedule/tours_list.json'), 'utf8')).tours[0].id).toBe('fall-1');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
