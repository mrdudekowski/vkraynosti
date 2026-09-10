import { getRuntimeTourById, getRuntimeTours } from './runtimeCatalog';
import type { Tour } from '../types';
import { TOUR_SLUG_ALIAS_TO_TOUR_ID } from './tourSlugs';

export function getTourBySlug(slug: string): Tour | undefined {
  const normalized = slug.trim();
  if (normalized.length === 0) {
    return undefined;
  }
  const bySlug = getRuntimeTours().find((tour) => tour.slug === normalized);
  if (bySlug != null) {
    return bySlug;
  }
  const aliasTourId =
    TOUR_SLUG_ALIAS_TO_TOUR_ID[normalized as keyof typeof TOUR_SLUG_ALIAS_TO_TOUR_ID];
  if (aliasTourId != null) {
    return getRuntimeTourById(aliasTourId);
  }
  return undefined;
}

export function findTourBySeasonAndSegment(
  season: Tour['season'],
  segment: string,
): Tour | undefined {
  const normalized = segment.trim();
  if (normalized.length === 0) {
    return undefined;
  }

  const catalog = getRuntimeTours();
  const bySlug = catalog.find((tour) => tour.season === season && tour.slug === normalized);
  if (bySlug != null) {
    return bySlug;
  }

  const aliasTourId =
    TOUR_SLUG_ALIAS_TO_TOUR_ID[normalized as keyof typeof TOUR_SLUG_ALIAS_TO_TOUR_ID];
  if (aliasTourId != null) {
    const byAlias = catalog.find((tour) => tour.season === season && tour.id === aliasTourId);
    if (byAlias != null) {
      return byAlias;
    }
  }

  return catalog.find((tour) => tour.season === season && tour.id === normalized);
}
