import type { Tour } from '../types';
import { TOURS } from './toursData';
import { TOUR_SLUG_ALIAS_TO_TOUR_ID } from './tourSlugs';

export function getTourBySlug(slug: string): Tour | undefined {
  const normalized = slug.trim();
  if (normalized.length === 0) {
    return undefined;
  }
  const bySlug = TOURS.find((tour) => tour.slug === normalized);
  if (bySlug != null) {
    return bySlug;
  }
  const aliasTourId =
    TOUR_SLUG_ALIAS_TO_TOUR_ID[normalized as keyof typeof TOUR_SLUG_ALIAS_TO_TOUR_ID];
  if (aliasTourId != null) {
    return TOURS.find((tour) => tour.id === aliasTourId);
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

  const bySlug = TOURS.find((tour) => tour.season === season && tour.slug === normalized);
  if (bySlug != null) {
    return bySlug;
  }

  const aliasTourId =
    TOUR_SLUG_ALIAS_TO_TOUR_ID[normalized as keyof typeof TOUR_SLUG_ALIAS_TO_TOUR_ID];
  if (aliasTourId != null) {
    const byAlias = TOURS.find((tour) => tour.season === season && tour.id === aliasTourId);
    if (byAlias != null) {
      return byAlias;
    }
  }

  return TOURS.find((tour) => tour.season === season && tour.id === normalized);
}
