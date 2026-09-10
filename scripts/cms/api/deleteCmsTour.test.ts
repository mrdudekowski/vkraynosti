/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import {
  CMS_DRAFT_INDEX_KEY,
  CMS_PUBLISHED_CATALOG_KEY,
  cmsDraftDocumentKey,
  cmsDraftMetaKey,
  cmsMediaObjectKey,
  cmsPublishedDocumentKey,
} from '../../../src/cms/cmsPackageKeys.ts';
import { cmsDraftIndexFile } from '../../../src/cms/cmsDraftIndex.ts';
import { createEmptyCmsTour } from '../../../src/cms/createEmptyCmsTour.ts';
import type { CmsTourDocument } from '../../../src/cms/cmsTourDocument.ts';
import { createMemoryJsonStore } from './store.ts';
import { deleteCmsTour } from './deleteCmsTour.ts';

function tour(id: string, title: string): CmsTourDocument {
  return createEmptyCmsTour({ id, slug: id, season: 'summer', title });
}

describe('deleteCmsTour', () => {
  it('deletes all CMS-owned tour objects and keeps unrelated data', async () => {
    const store = createMemoryJsonStore();
    const target = {
      ...tour('summer-1', 'Удаляемый тур'),
      assets: [
        {
          id: 'asset-1',
          stillUrl: 'https://cdn.example/media/tours/summer-1/asset-1.webp',
          videoUrl: null,
          alt: '',
        },
        {
          id: 'asset-2',
          stillUrl: 'https://external.example/asset.webp',
          videoUrl: null,
          alt: '',
        },
      ],
    };
    const unrelated = tour('summer-2', 'Оставляемый тур');
    await store.putJson(cmsDraftDocumentKey(target.id), target);
    await store.putJson(cmsDraftMetaKey(target.id), { rev: 1 });
    await store.putJson(cmsPublishedDocumentKey(target.id), target);
    await store.putJson(cmsDraftDocumentKey(unrelated.id), unrelated);
    await store.putJson(CMS_DRAFT_INDEX_KEY, cmsDraftIndexFile([target.id, unrelated.id]));
    await store.putJson(CMS_PUBLISHED_CATALOG_KEY, { schemaVersion: 1, tours: [target, unrelated] });
    await store.putBytes(cmsMediaObjectKey(target.id, 'asset-1.webp'), new Uint8Array([1]), 'image/webp');
    await store.putBytes(cmsMediaObjectKey(unrelated.id, 'asset-1.webp'), new Uint8Array([2]), 'image/webp');

    await deleteCmsTour(store, target);

    await expect(store.getJson(cmsDraftDocumentKey(target.id))).resolves.toBeNull();
    await expect(store.getJson(cmsDraftMetaKey(target.id))).resolves.toBeNull();
    await expect(store.getJson(cmsPublishedDocumentKey(target.id))).resolves.toBeNull();
    await expect(store.getBytes(cmsMediaObjectKey(target.id, 'asset-1.webp'))).resolves.toBeNull();
    await expect(store.getBytes(cmsMediaObjectKey(unrelated.id, 'asset-1.webp'))).resolves.not.toBeNull();
    await expect(store.getJson(cmsDraftDocumentKey(unrelated.id))).resolves.toEqual(unrelated);
    await expect(store.getJson(CMS_DRAFT_INDEX_KEY)).resolves.toEqual(
      cmsDraftIndexFile([unrelated.id]),
    );
    await expect(store.getJson(CMS_PUBLISHED_CATALOG_KEY)).resolves.toEqual({
      schemaVersion: 1,
      tours: [unrelated],
    });
  });
});
