import { describe, expect, it } from 'vitest';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  cmsDraftDocumentKey,
  cmsPublishedDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import {
  collectRewriteCandidateKeys,
  normalizePublicMediaOriginPrefix,
} from './rewritePublicMediaOriginKeys.ts';
import { createMemoryJsonStore } from './store.ts';

describe('normalizePublicMediaOriginPrefix', () => {
  it('accepts production CDN and legacy bucket origins', () => {
    expect(normalizePublicMediaOriginPrefix('https://ypnmfvotln.cdn.twcstorage.ru/')).toBe(
      'https://ypnmfvotln.cdn.twcstorage.ru',
    );
    expect(
      normalizePublicMediaOriginPrefix('https://s3.twcstorage.ru/vkraynosti-cms-dev'),
    ).toBe('https://s3.twcstorage.ru/vkraynosti-cms-dev');
  });

  it('rejects degenerate, query, multi-segment, and non-https values', () => {
    expect(normalizePublicMediaOriginPrefix('/')).toBeNull();
    expect(normalizePublicMediaOriginPrefix('https://cdn.example/?q=1')).toBeNull();
    expect(normalizePublicMediaOriginPrefix('http://cdn.example')).toBeNull();
    expect(normalizePublicMediaOriginPrefix('https://cdn.example/a/b')).toBeNull();
    expect(normalizePublicMediaOriginPrefix('a')).toBeNull();
  });
});

describe('collectRewriteCandidateKeys', () => {
  it('leniently extracts tour ids when catalog schema validation fails', async () => {
    const fallTour = {
      id: 'fall-1',
      slug: 'fall-1',
      assets: [{ id: 'cover', stillUrl: 'https://cdn.example/x.webp', videoUrl: null, alt: '' }],
    };
    const store = createMemoryJsonStore({
      [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [fallTour] },
      [CMS_DRAFT_INDEX_KEY]: { schemaVersion: 1, tourIds: ['fall-1'] },
    });

    const { keys, warnings } = await collectRewriteCandidateKeys(store);
    expect(warnings.some((item) => item.includes(CMS_PUBLISHED_CATALOG_KEY))).toBe(true);
    expect(keys).toContain(cmsDraftDocumentKey('fall-1'));
    expect(keys).toContain(cmsPublishedDocumentKey('fall-1'));
  });

  it('warns when catalog yields no tour ids', async () => {
    const store = createMemoryJsonStore({
      [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 2, tours: [] },
    });
    const { warnings } = await collectRewriteCandidateKeys(store);
    expect(warnings.some((item) => item.includes(CMS_PUBLISHED_CATALOG_KEY))).toBe(true);
  });
});
