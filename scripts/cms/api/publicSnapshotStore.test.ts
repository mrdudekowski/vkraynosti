import { describe, expect, it } from 'vitest';
import { CMS_PUBLISHED_CATALOG_KEY, CMS_PUBLISHED_SCHEDULE_KEY, CMS_PUBLISHED_TOURS_LIST_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { SITE_CONTENT_KINDS } from '../../../src/cms/siteContentDocument.ts';
import { createMemoryJsonStore, type CmsJsonStore } from './store.ts';
import { loadPublicSnapshotRelease } from './publicSnapshotStore.ts';

function siteSeo() {
  return {
    kind: 'seo',
    schemaVersion: 1,
    pages: ['home', 'winter', 'spring', 'summer', 'fall', 'privacy'].map((key) => ({
      key,
      path: key === 'home' ? '/' : key === 'privacy' ? '/privacy/' : `/tours/${key}/`,
      title: `${key} title`,
      description: `${key} description`,
      h1: `${key} heading`,
      keywords: [],
    })),
  };
}

function sourceStore() {
  return createMemoryJsonStore({
    [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [] },
    [CMS_PUBLISHED_TOURS_LIST_KEY]: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', tours: [] },
    [CMS_PUBLISHED_SCHEDULE_KEY]: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] },
    ...Object.fromEntries(SITE_CONTENT_KINDS.map((kind) => [siteContentPublishedKey(kind), kind === 'seo' ? siteSeo() : null])),
  });
}

describe('loadPublicSnapshotRelease', () => {
  it('loads a complete validated release with all site SEO pages', async () => {
    const release = await loadPublicSnapshotRelease(sourceStore(), {
      sourceKind: 's3',
      generatedAt: '2026-11-11T00:00:00.000Z',
    });

    expect(release.payload.siteContent.seo).toMatchObject({ pages: expect.arrayContaining([expect.objectContaining({ key: 'privacy' })]) });
  });

  it('retries if a published key changes between the two snapshot reads', async () => {
    const backing = sourceStore();
    const originalGet = backing.getJson;
    let changedDuringFirstRead = false;
    const store: CmsJsonStore = {
      ...backing,
      async getJson(key) {
        const value = await originalGet(key);
        if (key === siteContentPublishedKey('seo') && !changedDuringFirstRead) {
          changedDuringFirstRead = true;
          await backing.putJson(CMS_PUBLISHED_TOURS_LIST_KEY, {
            schemaVersion: 1,
            generatedAt: '2026-11-12T00:00:00.000Z',
            tours: [],
          });
        }
        return value;
      },
    };

    const release = await loadPublicSnapshotRelease(store, {
      sourceKind: 's3',
      generatedAt: '2026-11-11T00:00:00.000Z',
      readAttempts: 2,
    });
    expect(release.manifest.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('fails closed when the published snapshot changes on every attempt', async () => {
    const backing = sourceStore();
    let serial = 0;
    const store: CmsJsonStore = {
      ...backing,
      async getJson(key) {
        const value = await backing.getJson(key);
        if (key === CMS_PUBLISHED_CATALOG_KEY) {
          serial += 1;
          return { ...(value as object), marker: serial };
        }
        return value;
      },
    };

    await expect(loadPublicSnapshotRelease(store, {
      sourceKind: 's3',
      generatedAt: '2026-11-11T00:00:00.000Z',
      readAttempts: 2,
    })).rejects.toThrow('Published CMS data changed while the release snapshot was being read');
  });

  it('does not substitute an empty catalog for a missing required document', async () => {
    const backing = sourceStore();
    const store: CmsJsonStore = {
      ...backing,
      async getJson(key) {
        if (key === CMS_PUBLISHED_SCHEDULE_KEY) return null;
        return backing.getJson(key);
      },
    };

    await expect(loadPublicSnapshotRelease(store, { sourceKind: 's3' })).rejects.toThrow();
  });
});
