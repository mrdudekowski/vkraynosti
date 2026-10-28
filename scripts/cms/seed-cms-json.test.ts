/** @vitest-environment node */
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CMS_CRM_KEY } from '../../src/cms/cmsPackageKeys.ts';
import { createMemoryJsonStore } from './api/store.ts';
import { seedCmsJsonFromFilesystem } from './seed-cms-json.ts';

describe('seedCmsJsonFromFilesystem', () => {
  it('upserts published/tours.json from a filesystem catalog', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'cms-seed-'));
    await mkdir(path.join(dir, 'published'), { recursive: true });
    await writeFile(
      path.join(dir, 'published', 'tours.json'),
      '{"schemaVersion":1,"tours":[]}\n',
    );
    const store = createMemoryJsonStore();
    await seedCmsJsonFromFilesystem(dir, store);
    await expect(store.getJson('published/tours.json')).resolves.toEqual({
      schemaVersion: 1,
      tours: [],
    });
  });

  it('skips manifest.json and writes an empty CRM file when missing', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'cms-seed-'));
    await writeFile(path.join(dir, 'manifest.json'), '{"ok":true}\n');
    const store = createMemoryJsonStore();
    await seedCmsJsonFromFilesystem(dir, store);
    await expect(store.getJson('manifest.json')).resolves.toBeNull();
    const crm = await store.getJson(CMS_CRM_KEY) as { schemaVersion: number };
    expect(crm.schemaVersion).toBe(1);
  });
});
