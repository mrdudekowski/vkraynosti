import { z } from 'zod';

export const CMS_TOUR_CATALOG_ORDER_SCHEMA_VERSION = 1 as const;

export const CMS_TOUR_SEASONS = ['winter', 'spring', 'summer', 'fall'] as const;

export type CmsTourSeason = (typeof CMS_TOUR_SEASONS)[number];

export const tourCatalogOrderSchema = z.object({
  schemaVersion: z.literal(CMS_TOUR_CATALOG_ORDER_SCHEMA_VERSION),
  rev: z.number().int().positive(),
  tourIds: z.array(z.string().min(1)),
});

export type TourCatalogOrder = z.infer<typeof tourCatalogOrderSchema>;

export function parseTourCatalogOrder(input: unknown): TourCatalogOrder {
  return tourCatalogOrderSchema.parse(input);
}

function uniqueIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const id of ids) {
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    unique.push(id);
  }
  return unique;
}

function sameIdSequence(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

/** Порядок гостевых карточек — порядок id. Id вне списка остаются в прежнем взаимном порядке в конце. */
export function orderByIds<T extends { id: string }>(
  items: readonly T[],
  orderedIds: readonly string[],
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const next: T[] = [];
  for (const id of orderedIds) {
    if (seen.has(id)) {
      continue;
    }
    const item = byId.get(id);
    if (item == null) {
      continue;
    }
    seen.add(id);
    next.push(item);
  }
  for (const item of items) {
    if (!seen.has(item.id)) {
      next.push(item);
    }
  }
  return next;
}

/**
 * Сезоны в каталоге могут идти вперемешку.
 * Блок сезона встаёт на место первого тура этого сезона, остальные сезоны не двигаются друг относительно друга.
 */
export function replaceSeasonIds(
  tourIds: readonly string[],
  seasonIds: ReadonlySet<string>,
  nextSeasonIds: readonly string[],
): string[] {
  const block = uniqueIds(nextSeasonIds);
  const members = new Set<string>([...seasonIds, ...block]);
  const rest: string[] = [];
  let insertAt: number | null = null;
  for (const id of tourIds) {
    if (members.has(id)) {
      if (insertAt == null) {
        insertAt = rest.length;
      }
      continue;
    }
    rest.push(id);
  }
  if (insertAt == null) {
    return [...rest, ...block];
  }
  return [...rest.slice(0, insertAt), ...block, ...rest.slice(insertAt)];
}

export function seasonIdsMatch(expected: readonly string[], received: readonly string[]): boolean {
  if (expected.length !== received.length) {
    return false;
  }
  const expectedIds = new Set(expected);
  const receivedIds = new Set(received);
  if (expectedIds.size !== expected.length || receivedIds.size !== received.length) {
    return false;
  }
  for (const id of expectedIds) {
    if (!receivedIds.has(id)) {
      return false;
    }
  }
  return true;
}

/** Черновик порядка меняет сайт только если уже опубликованные туры стоят иначе. */
export function catalogOrderIsUnpublished(
  catalogIds: readonly string[],
  draftIds: readonly string[],
): boolean {
  const arranged = orderByIds(
    catalogIds.map((id) => ({ id })),
    draftIds,
  ).map((item) => item.id);
  return !sameIdSequence(catalogIds, arranged);
}

/** Новый тур занимает слот из черновика. Уже стоящие в каталоге туры местами не меняются. */
export function insertTourAtDraftSlot<T extends { id: string }>(
  tours: readonly T[],
  tour: T,
  orderedIds: readonly string[] | null,
): T[] {
  const existingIndex = tours.findIndex((item) => item.id === tour.id);
  if (existingIndex >= 0) {
    return tours.map((item, index) => (index === existingIndex ? tour : item));
  }
  if (orderedIds == null) {
    return [...tours, tour];
  }
  const catalogIds = new Set(tours.map((item) => item.id));
  const position = orderedIds.indexOf(tour.id);
  if (position < 0) {
    return [...tours, tour];
  }
  for (let index = position + 1; index < orderedIds.length; index += 1) {
    const anchor = orderedIds[index];
    if (anchor == null || !catalogIds.has(anchor)) {
      continue;
    }
    const anchorIndex = tours.findIndex((item) => item.id === anchor);
    if (anchorIndex < 0) {
      continue;
    }
    const next = [...tours];
    next.splice(anchorIndex, 0, tour);
    return next;
  }
  return [...tours, tour];
}
