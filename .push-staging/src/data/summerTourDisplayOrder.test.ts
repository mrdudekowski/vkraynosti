import { describe, expect, it } from 'vitest';
import { SUMMER_TOUR_DISPLAY_ORDER } from '../constants/summerTourDisplayOrder';
import { getToursBySeason } from './toursData';

describe('summer tour display order', () => {
  it('matches the canonical summer card order for listed tours', () => {
    const summerIds = getToursBySeason('summer').map((tour) => tour.id);
    const listedIds = summerIds.filter((id) =>
      SUMMER_TOUR_DISPLAY_ORDER.includes(id as (typeof SUMMER_TOUR_DISPLAY_ORDER)[number]),
    );

    expect(listedIds).toEqual([...SUMMER_TOUR_DISPLAY_ORDER]);
  });
});
