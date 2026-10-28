/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CMS_PUBLISHED_CATALOG_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { getCatalogMirrorState, setCatalogMirrorState } from './catalogMirrorState.ts';
import { createCmsApiApp } from './app.ts';
import type { CmsApiEnv } from './env.ts';
import { probeCatalogMirrorNow, runStorageBootProbes } from './storageBootProbe.ts';
import { createStorageCircuit } from './storageCircuit.ts';
import { createMemoryJsonStore, type CmsJsonStore } from './store.ts';

const baseEnv = {
  storeKind: 's3',
  jsonStoreKind: 'postgres',
  storageCanaryKey: 'media/tours/fall-1/cover.webp',
  s3: {
    endpoint: 'https://example.test',
    region: 'ru-1',
    bucket: 'test',
    accessKey: 'key',
    secretKey: 'secret',
  },
} as CmsApiEnv;

function minimalAppDeps(storageCircuit: ReturnType<typeof createStorageCircuit>) {
  return {
    env: {} as CmsApiEnv,
    store: createMemoryJsonStore(),
    authRepository: {} as never,
    departureRepository: {} as never,
    storageCircuit,
  };
}

describe('runStorageBootProbes', () => {
  beforeEach(() => {
    setCatalogMirrorState('down');
  });

  it('opens storage circuit when byte canary throws UserSuspended without any upload', async () => {
    let putBytesCalled = false;
    const bytesStore: Pick<CmsJsonStore, 'getBytes' | 'putBytes'> = {
      getBytes: async () => {
        throw new Error('UserSuspended');
      },
      putBytes: async () => {
        putBytesCalled = true;
      },
    };
    const storageCircuit = createStorageCircuit(async () => undefined);
    await runStorageBootProbes({
      env: baseEnv,
      store: bytesStore,
      storageCircuit,
      probeCatalogMirror: async () => undefined,
    });

    expect(putBytesCalled).toBe(false);
    expect(storageCircuit.state()).toBe('open');

    const { app } = { app: createCmsApiApp(minimalAppDeps(storageCircuit)) };
    const response = await app.request('/api/cms/health');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { storage: string; ok: boolean };
    expect(body.storage).toBe('open');
    expect(body.ok).toBe(true);
  });

  it('sets catalogMirror down when mirror getJson fails and keeps ok true', async () => {
    const storageCircuit = createStorageCircuit(async () => undefined);
    const store = createMemoryJsonStore();
    await runStorageBootProbes({
      env: baseEnv,
      store,
      storageCircuit,
      probeCatalogMirror: async () => {
        throw new Error('UserSuspended');
      },
    });

    expect(getCatalogMirrorState()).toBe('down');
    expect(storageCircuit.state()).toBe('closed');

    const app = createCmsApiApp(minimalAppDeps(storageCircuit));
    const response = await app.request('/api/cms/health');
    const body = (await response.json()) as { catalogMirror: string; ok: boolean; storage: string };
    expect(body.catalogMirror).toBe('down');
    expect(body.ok).toBe(true);
    expect(body.storage).toBe('closed');
  });

  it('sets catalogMirror down when mirror getJson resolves to null', async () => {
    const storageCircuit = createStorageCircuit(async () => undefined);
    const store = createMemoryJsonStore();
    await runStorageBootProbes({
      env: baseEnv,
      store,
      storageCircuit,
      probeCatalogMirror: async () => null,
    });

    expect(getCatalogMirrorState()).toBe('down');

    const app = createCmsApiApp(minimalAppDeps(storageCircuit));
    const response = await app.request('/api/cms/health');
    const body = (await response.json()) as { catalogMirror: string; ok: boolean };
    expect(body.catalogMirror).toBe('down');
    expect(body.ok).toBe(true);
  });

  it('sets catalogMirror up after successful mirror getJson returns a body', async () => {
    const storageCircuit = createStorageCircuit(async () => undefined);
    const store = createMemoryJsonStore();
    const catalog = { schemaVersion: 1, tours: [] };
    await runStorageBootProbes({
      env: baseEnv,
      store,
      storageCircuit,
      probeCatalogMirror: async () =>
        createMemoryJsonStore({ [CMS_PUBLISHED_CATALOG_KEY]: catalog }).getJson(
          CMS_PUBLISHED_CATALOG_KEY,
        ),
    });

    expect(getCatalogMirrorState()).toBe('up');
  });

  it('sets catalogMirror up on storage recovery when mirror returns non-null', async () => {
    setCatalogMirrorState('down');
    const catalog = { schemaVersion: 1, tours: [] };
    const storageCircuit = createStorageCircuit(async () => undefined, {
      onStorageRecovery: () =>
        probeCatalogMirrorNow({
          env: baseEnv,
          probeCatalogMirror: async () => catalog,
        }),
    });

    storageCircuit.reportSuccess();
    await Promise.resolve();

    expect(getCatalogMirrorState()).toBe('up');
  });

  it('keeps catalogMirror down on storage recovery when mirror returns null', async () => {
    setCatalogMirrorState('down');
    const storageCircuit = createStorageCircuit(async () => undefined, {
      onStorageRecovery: () =>
        probeCatalogMirrorNow({
          env: baseEnv,
          probeCatalogMirror: async () => null,
        }),
    });

    storageCircuit.reportSuccess();
    await Promise.resolve();

    expect(getCatalogMirrorState()).toBe('down');
  });

  it('does not call storageCircuit.reportFailure when mirror probe fails', async () => {
    const storageCircuit = createStorageCircuit(async () => undefined);
    const reportFailure = vi.spyOn(storageCircuit, 'reportFailure');
    const store = createMemoryJsonStore();

    await runStorageBootProbes({
      env: baseEnv,
      store,
      storageCircuit,
      probeCatalogMirror: async () => {
        throw new Error('403');
      },
    });

    expect(reportFailure).not.toHaveBeenCalled();
    expect(getCatalogMirrorState()).toBe('down');
  });

  it('sets catalogMirror up when storeKind is not s3 without calling mirror probe', async () => {
    const storageCircuit = createStorageCircuit(async () => undefined);
    const probeCatalogMirror = vi.fn(async () => undefined);
    await runStorageBootProbes({
      env: { ...baseEnv, storeKind: 'filesystem' },
      store: createMemoryJsonStore(),
      storageCircuit,
      probeCatalogMirror,
    });

    expect(probeCatalogMirror).not.toHaveBeenCalled();
    expect(getCatalogMirrorState()).toBe('up');
  });
});
