import type { Tour } from '../types';
import { TOURS } from './toursData';

export function getTourBySlug(slug: string): Tour | undefined {
  const normalized = slug.trim();
  if (normalized.length === 0) {
    return undefined;
  }
  return TOURS.find((tour) => tour.slug === normalized);
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

  return TOURS.find((tour) => tour.season === season && tour.id === normalized);
}
