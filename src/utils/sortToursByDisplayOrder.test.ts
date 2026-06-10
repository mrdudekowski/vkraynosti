import { describe, expect, it } from 'vitest';
import { SUMMER_TOUR_DISPLAY_ORDER } from '../constants/summerTourDisplayOrder';
import { sortToursByDisplayOrder } from './sortToursByDisplayOrder';

describe('sortToursByDisplayOrder', () => {
  it('sorts listed ids by display order', () => {
    const input = [
      { id: 'summer-1' },
      { id: 'summer-4' },
      { id: 'summer-3' },
      { id: 'summer-2' },
    ];

    expect(sortToursByDisplayOrder(input, SUMMER_TOUR_DISPLAY_ORDER).map((item) => item.id)).toEqual([
      'summer-4',
      'summer-3',
      'summer-2',
      'summer-1',
    ]);
  });

  it('places unlisted ids after the display order block', () => {
    const input = [{ id: 'summer-13' }, { id: 'summer-9' }, { id: 'summer-12' }];

    expect(sortToursByDisplayOrder(input, SUMMER_TOUR_DISPLAY_ORDER).map((item) => item.id)).toEqual([
      'summer-9',
      'summer-12',
      'summer-13',
    ]);
  });
});
