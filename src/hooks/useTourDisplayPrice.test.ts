import { describe, expect, it } from 'vitest';
import { resolveTourDisplayPrice } from './useTourDisplayPrice';

const tour = {
  id: 'summer-1',
  price: '18 000 ₽',
  pricePrevious: '15 000 ₽',
  season: 'summer' as const,
};

describe('resolveTourDisplayPrice', () => {
  it('uses the published tour price when a schedule catalog disagrees', () => {
    expect(resolveTourDisplayPrice(tour)).toEqual({
      displayPrice: '18 000 ₽',
      displayPricePrevious: '15 000 ₽',
    });
  });

  it('always uses the CMS tour price', () => {
    expect(resolveTourDisplayPrice(tour)).toEqual({
      displayPrice: '18 000 ₽',
      displayPricePrevious: '15 000 ₽',
    });
  });
});
