/** @vitest-environment node */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CmsApiEnv } from './env.ts';
import {
  createCmsJsonStore,
  createFilesystemJsonStore,
  createMemoryJsonStore,
  createSplitJsonStore,
} from './store.ts';

describe('createFilesystemJsonStore', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir.length > 0) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('reads and writes nested json keys', async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'cms-store-'));
    const store = createFilesystemJsonStore(tempDir);
    await store.putJson('draft/tours/winter-1/document.json', { id: 'winter-1' });
    await expect(store.getJson('draft/tours/winter-1/document.json')).resolves.toEqual({
      id: 'winter-1',
    });
    const filePath = path.join(tempDir, 'draft', 'tours', 'winter-1', 'document.json');
    await expect(readFile(filePath, 'utf8')).resolves.toContain('winter-1');
  });
});

describe('createSplitJsonStore', () => {
  it('reads json from one backend and bytes from another', async () => {
    const json = createMemoryJsonStore();
    const bytes = createMemoryJsonStore();
    const store = createSplitJsonStore(json, bytes);

    await store.putJson('draft/tours.json', { tours: [] });
    await store.putBytes('media/tours/fall-1/cover.webp', new Uint8Array([9, 8, 7]), 'image/webp');

    await expect(store.getJson('draft/tours.json')).resolves.toEqual({ tours: [] });
    await expect(bytes.getJson('draft/tours.json')).resolves.toBeNull();
    await expect(store.getBytes('media/tours/fall-1/cover.webp')).resolves.toEqual({
      body: new Uint8Array([9, 8, 7]),
      contentType: null,
    });
    await expect(json.getBytes('media/tours/fall-1/cover.webp')).resolves.toBeNull();
  });
});

describe('createCmsJsonStore', () => {
  it('keeps a single filesystem backend when json and bytes share it', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cms-store-fs-'));
    try {
      const env = {
        storeKind: 'filesystem',
        jsonStoreKind: 'filesystem',
        localStoreDir: root,
      } as CmsApiEnv;
      const store = createCmsJsonStore(env);
      await store.putJson('published/tours.json', { schemaVersion: 1 });
      await expect(store.getJson('published/tours.json')).resolves.toEqual({ schemaVersion: 1 });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('requires a database when JSON lives in postgres', () => {
    const env = {
      storeKind: 'filesystem',
      jsonStoreKind: 'postgres',
      localStoreDir: 'tmp/cms-catalog',
    } as CmsApiEnv;
    expect(() => createCmsJsonStore(env)).toThrow('CMS_JSON_STORE=postgres requires a database');
  });
});
