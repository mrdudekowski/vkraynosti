import { describe, expect, it } from 'vitest';
import { formatTourDisplayPrice, normalizeTourPrice } from './tourPrice';

describe('tour price formatting', () => {
  it('normalizes numeric prices and extracts the legacy from prefix', () => {
    expect(normalizeTourPrice('5000')).toEqual({ price: '5000 ₽', priceFrom: false });
    expect(normalizeTourPrice('  от 5 000 ₽ ')).toEqual({ price: '5 000 ₽', priceFrom: true });
    expect(normalizeTourPrice('5 000 ₽')).toEqual({ price: '5 000 ₽', priceFrom: false });
  });

  it('preserves request prices and applies from only to numeric prices', () => {
    expect(normalizeTourPrice('по запросу')).toEqual({ price: 'по запросу', priceFrom: false });
    expect(formatTourDisplayPrice('5000', true)).toBe('от 5000 ₽');
    expect(formatTourDisplayPrice('по запросу', true)).toBe('по запросу');
  });
});
