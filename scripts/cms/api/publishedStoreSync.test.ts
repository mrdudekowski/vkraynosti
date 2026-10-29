/** @vitest-environment node */
import { beforeEach, describe, expect, it } from 'vitest';
import { CMS_PUBLISHED_CATALOG_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { getPublishedSyncState, setPublishedSyncState } from './publishedSyncState.ts';
import { reconcilePublishedJson } from './publishedStoreSync.ts';
import { createMemoryJsonStore } from './store.ts';

describe('reconcilePublishedJson', () => {
  beforeEach(() => {
    setPublishedSyncState('unknown');
  });

  it('copies a published document into the empty database and leaves a differing document untouched', async () => {
    const database = createMemoryJsonStore({
      [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [{ id: 'fall-1' }] },
      'published/tours/fall-1/document.json': { id: 'fall-1', title: 'Старый черновик базы' },
    });
    const s3 = createMemoryJsonStore({
      [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [{ id: 'fall-1' }] },
      'published/tours/fall-1/document.json': { id: 'fall-1', title: 'Уже на сайте' },
      [siteContentPublishedKey('seo')]: { kind: 'seo', title: 'SEO с сайта' },
    });

    const rows = await reconcilePublishedJson(database, s3);

    expect(rows).toEqual(expect.arrayContaining([
      { key: 'published/tours/fall-1/document.json', status: 'differ', repaired: false },
      { key: siteContentPublishedKey('seo'), status: 'missing-in-db', repaired: true },
    ]));
    expect(await database.getJson('published/tours/fall-1/document.json')).toEqual({
      id: 'fall-1',
      title: 'Старый черновик базы',
    });
    expect(await database.getJson(siteContentPublishedKey('seo'))).toEqual({
      kind: 'seo',
      title: 'SEO с сайта',
    });
    expect(await s3.getJson('published/tours/fall-1/document.json')).toEqual({
      id: 'fall-1',
      title: 'Уже на сайте',
    });
    expect(getPublishedSyncState()).toBe('drift');
  });

  it('copies a database-only published document to S3', async () => {
    const database = createMemoryJsonStore({
      [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [] },
      [siteContentPublishedKey('seo')]: { kind: 'seo', title: 'Только в базе' },
    });
    const s3 = createMemoryJsonStore({
      [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [] },
    });

    const rows = await reconcilePublishedJson(database, s3);

    expect(rows).toEqual(expect.arrayContaining([
      { key: siteContentPublishedKey('seo'), status: 'missing-in-s3', repaired: true },
    ]));
    expect(await s3.getJson(siteContentPublishedKey('seo'))).toEqual({
      kind: 'seo',
      title: 'Только в базе',
    });
    expect(getPublishedSyncState()).toBe('match');
  });
});
