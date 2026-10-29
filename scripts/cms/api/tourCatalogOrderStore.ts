import { z } from 'zod';
import { CMS_PUBLISHED_CATALOG_KEY, CMS_TOUR_CATALOG_ORDER_KEY } from '../../../src/cms/cmsPackageKeys.ts';
import { parseCmsToursFile } from '../../../src/cms/cmsTourDocument.ts';
import {
  CMS_TOUR_SEASONS,
  catalogOrderIsUnpublished,
  orderByIds,
  parseTourCatalogOrder,
  replaceSeasonIds,
  seasonIdsMatch,
  type TourCatalogOrder,
} from '../../../src/cms/tourCatalogOrder.ts';
import type { CmsJsonStore } from './store.ts';

const saveBodySchema = z.object({
  rev: z.number().int().nonnegative(),
  season: z.enum(CMS_TOUR_SEASONS),
  tourIds: z.array(z.string().min(1)),
});

const publishBodySchema = z.object({
  rev: z.number().int().nonnegative(),
});

export type TourCatalogOrderState = {
  rev: number;
  unpublished: boolean;
  tourIds: string[];
};

export type TourCatalogOrderResult =
  | { ok: true; state: TourCatalogOrderState }
  | { ok: false; error: 'invalid_body' | 'rev_conflict'; rev?: number };

type TourRef = { id: string; season: string };

async function readDraftOrder(store: CmsJsonStore): Promise<TourCatalogOrder | null> {
  const raw = await store.getJson(CMS_TOUR_CATALOG_ORDER_KEY);
  if (raw == null) {
    return null;
  }
  try {
    return parseTourCatalogOrder(raw);
  } catch {
    return null;
  }
}

function stateFor(
  catalogIds: readonly string[],
  order: TourCatalogOrder | null,
): TourCatalogOrderState {
  if (order == null) {
    return { rev: 0, unpublished: false, tourIds: [...catalogIds] };
  }
  return {
    rev: order.rev,
    unpublished: catalogOrderIsUnpublished(catalogIds, order.tourIds),
    tourIds: order.tourIds,
  };
}

export async function readDraftTourOrderIds(store: CmsJsonStore): Promise<readonly string[] | null> {
  const order = await readDraftOrder(store);
  return order == null ? null : order.tourIds;
}

export async function readTourCatalogOrderState(
  store: CmsJsonStore,
  catalogIds: readonly string[],
): Promise<TourCatalogOrderState> {
  return stateFor(catalogIds, await readDraftOrder(store));
}

export async function removeTourIdFromCatalogOrder(store: CmsJsonStore, tourId: string): Promise<void> {
  const order = await readDraftOrder(store);
  if (order == null || !order.tourIds.includes(tourId)) {
    return;
  }
  await store.putJson(CMS_TOUR_CATALOG_ORDER_KEY, {
    schemaVersion: 1,
    rev: order.rev + 1,
    tourIds: order.tourIds.filter((id) => id !== tourId),
  } satisfies TourCatalogOrder);
}

export async function saveSeasonTourOrder(
  store: CmsJsonStore,
  input: {
    documents: readonly TourRef[];
    catalogIds: readonly string[];
    body: unknown;
  },
): Promise<TourCatalogOrderResult> {
  const parsed = saveBodySchema.safeParse(input.body);
  if (!parsed.success) {
    return { ok: false, error: 'invalid_body' };
  }
  const seasonTours = input.documents.filter((tour) => tour.season === parsed.data.season);
  if (!seasonIdsMatch(seasonTours.map((tour) => tour.id), parsed.data.tourIds)) {
    return { ok: false, error: 'invalid_body' };
  }
  const current = await readDraftOrder(store);
  const currentRev = current?.rev ?? 0;
  if (parsed.data.rev !== currentRev) {
    return { ok: false, error: 'rev_conflict', rev: currentRev };
  }
  const baseline = orderByIds(
    input.documents.map((tour) => ({ id: tour.id })),
    current?.tourIds ?? input.catalogIds,
  ).map((tour) => tour.id);
  const tourIds = replaceSeasonIds(
    baseline,
    new Set(seasonTours.map((tour) => tour.id)),
    parsed.data.tourIds,
  );
  const next: TourCatalogOrder = {
    schemaVersion: 1,
    rev: currentRev + 1,
    tourIds,
  };
  await store.putJson(CMS_TOUR_CATALOG_ORDER_KEY, next);
  return { ok: true, state: stateFor(input.catalogIds, next) };
}

export async function publishStoredTourCatalogOrder(
  store: CmsJsonStore,
  body: unknown,
): Promise<TourCatalogOrderResult> {
  const parsed = publishBodySchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'invalid_body' };
  }
  const current = await readDraftOrder(store);
  const currentRev = current?.rev ?? 0;
  if (parsed.data.rev !== currentRev) {
    return { ok: false, error: 'rev_conflict', rev: currentRev };
  }
  const rawCatalog = await store.getJson(CMS_PUBLISHED_CATALOG_KEY);
  const catalog = rawCatalog == null ? null : parseCmsToursFile(rawCatalog);
  if (current != null && catalog != null) {
    await store.putJson(CMS_PUBLISHED_CATALOG_KEY, {
      schemaVersion: catalog.schemaVersion,
      tours: orderByIds(catalog.tours, current.tourIds),
    });
  }
  return {
    ok: true,
    state: {
      rev: currentRev,
      unpublished: false,
      tourIds: current?.tourIds ?? catalog?.tours.map((tour) => tour.id) ?? [],
    },
  };
}
