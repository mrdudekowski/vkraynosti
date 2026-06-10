import { describe, expect, it } from 'vitest';
import { TOURS } from './toursData';
import { TOUR_SLUG_BY_ID, applyTourSlug } from './tourSlugs';
import { validateTourSlugs } from '../constants/tourUrls';
import { getTourPublicPath } from '../constants/tourUrls';

describe('TOUR_SLUG_BY_ID', () => {
  it('covers every tour in the catalog', () => {
    const catalogIds = TOURS.map((tour) => tour.id).sort();
    const slugIds = Object.keys(TOUR_SLUG_BY_ID).sort();
    expect(slugIds).toEqual(catalogIds);
  });

  it('passes slug validation for the full catalog', () => {
    expect(() => validateTourSlugs(TOURS)).not.toThrow();
  });

  it('assigns slug on every tour via applyTourSlug', () => {
    for (const tour of TOURS) {
      const withSlug = applyTourSlug(tour);
      expect(withSlug.slug).toBe(TOUR_SLUG_BY_ID[tour.id as keyof typeof TOUR_SLUG_BY_ID]);
      expect(getTourPublicPath(withSlug)).not.toContain(tour.id);
    }
  });
});
