/** @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { CMS_PUBLISHED_CATALOG_KEY, CMS_TOUR_CATALOG_ORDER_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { createEmptyCmsTour } from '../../../src/cms/createEmptyCmsTour.ts';
import type { CmsTourDocument } from '../../../src/cms/cmsTourDocument.ts';
import { parseCmsToursFile } from '../../../src/cms/cmsTourDocument.ts';
import { createMemoryJsonStore } from './store.ts';
import { publishStoredTourCatalogOrder, saveSeasonTourOrder } from './tourCatalogOrderStore.ts';

function activeTour(id: string, season: CmsTourDocument['season']): CmsTourDocument {
  return { ...createEmptyCmsTour({ id, slug: id, season, title: id }), status: 'active' };
}

describe('tour catalog order store', () => {
  it('сохраняет порядок сезона и публикует его в каталог', async () => {
    const store = createMemoryJsonStore();
    const summerA = activeTour('summer-1', 'summer');
    const summerB = activeTour('summer-2', 'summer');
    const winter = activeTour('winter-1', 'winter');
    await store.putJson(CMS_PUBLISHED_CATALOG_KEY, {
      schemaVersion: 1,
      tours: [summerA, winter, summerB],
    });
    const documents = [summerA, winter, summerB];

    const saved = await saveSeasonTourOrder(store, {
      documents,
      catalogIds: documents.map((tour) => tour.id),
      body: { rev: 0, season: 'summer', tourIds: ['summer-2', 'summer-1'] },
    });

    expect(saved).toEqual({
      ok: true,
      state: {
        rev: 1,
        unpublished: true,
        tourIds: ['summer-2', 'summer-1', 'winter-1'],
      },
    });

    const published = await publishStoredTourCatalogOrder(store, { rev: 1 });
    expect(published.ok).toBe(true);
    if (!published.ok) {
      return;
    }
    expect(published.state.unpublished).toBe(false);
    const catalog = parseCmsToursFile(await store.getJson(CMS_PUBLISHED_CATALOG_KEY));
    expect(catalog.tours.map((tour) => tour.id)).toEqual(['summer-2', 'summer-1', 'winter-1']);

    const again = await publishStoredTourCatalogOrder(store, { rev: 1 });
    expect(again).toMatchObject({ ok: true, state: { rev: 1, unpublished: false } });
  });

  it('отклоняет устаревшую ревизию и неполный набор сезона', async () => {
    const store = createMemoryJsonStore();
    await store.putJson(CMS_TOUR_CATALOG_ORDER_KEY, {
      schemaVersion: 1,
      rev: 4,
      tourIds: ['summer-1', 'summer-2'],
    });
    const documents = [activeTour('summer-1', 'summer'), activeTour('summer-2', 'summer')];

    const conflict = await saveSeasonTourOrder(store, {
      documents,
      catalogIds: ['summer-1', 'summer-2'],
      body: { rev: 3, season: 'summer', tourIds: ['summer-2', 'summer-1'] },
    });
    expect(conflict).toEqual({ ok: false, error: 'rev_conflict', rev: 4 });

    const partial = await saveSeasonTourOrder(store, {
      documents,
      catalogIds: ['summer-1', 'summer-2'],
      body: { rev: 4, season: 'summer', tourIds: ['summer-2'] },
    });
    expect(partial).toEqual({ ok: false, error: 'invalid_body' });
  });
});
