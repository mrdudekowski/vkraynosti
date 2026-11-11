import { describe, expect, it } from 'vitest';
import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
} from '../../../src/cms/cmsPackageKeys.ts';
import { SITE_CONTENT_KINDS } from '../../../src/cms/siteContentDocument.ts';
import { siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { createMemoryJsonStore } from './store.ts';
import { loadPublicSnapshotRelease } from './publicSnapshotStore.ts';

function legacySeoDocument() {
  return {
    kind: 'seo',
    schemaVersion: 1,
    pages: ['home', 'winter', 'spring', 'summer', 'fall'].map((key) => ({
      key,
      path: key === 'home' ? '/' : `/tours/${key}/`,
      title: `${key} title`,
      description: `${key} description`,
      h1: `${key} heading`,
      keywords: [],
    })),
  };
}

function storeWithLegacySeo() {
  return createMemoryJsonStore({
    [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [] },
    [CMS_PUBLISHED_TOURS_LIST_KEY]: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      tours: [],
    },
    [CMS_PUBLISHED_SCHEDULE_KEY]: {
      schemaVersion: 1,
      generatedAt: '2026-11-11T00:00:00.000Z',
      events: [],
    },
    ...Object.fromEntries(SITE_CONTENT_KINDS.map((kind) => [
      siteContentPublishedKey(kind),
      kind === 'seo' ? legacySeoDocument() : null,
    ])),
  });
}

describe('loadPublicSnapshotRelease legacy SEO compatibility', () => {
  it('completes a published legacy SEO document with the fixed Privacy route', async () => {
    const release = await loadPublicSnapshotRelease(storeWithLegacySeo(), { sourceKind: 'postgres' });

    expect(release.payload.siteContent.seo.pages).toHaveLength(6);
    expect(release.payload.siteContent.seo.pages).toContainEqual({
      key: 'privacy',
      path: '/privacy/',
      title: '',
      description: '',
      h1: '',
      keywords: [],
    });
  });
});
