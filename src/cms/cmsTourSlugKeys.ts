import type { CmsTourDocument } from './cmsTourDocument';

/** Slugs are unique within a season; tour IDs remain globally reserved. */
export function getTakenCmsTourSlugKeys(
  tours: readonly Pick<CmsTourDocument, 'id' | 'season' | 'slug'>[],
  season: CmsTourDocument['season'],
  exceptId?: string,
): Set<string> {
  const taken = new Set<string>();
  for (const tour of tours) {
    if (tour.id === exceptId) continue;
    if (tour.season === season) taken.add(tour.slug);
    taken.add(tour.id);
  }
  return taken;
}
