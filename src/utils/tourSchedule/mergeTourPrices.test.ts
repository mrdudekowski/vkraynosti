import { describe, expect, it } from 'vitest';
import { mergeTourPrices } from './mergeTourPrices';
import type { TourScheduleEvent } from '../../types/tourSchedule';

const event = (tourId: string, priceRub: number | null): TourScheduleEvent => ({
  date: '2026-05-09',
  tourId,
  durationType: 'однодневный',
  priceRub,
  seats: 8,
  status: 'open',
  comment: null,
});

describe('mergeTourPrices', () => {
  it('prefers catalog prices over event prices', () => {
    const prices = mergeTourPrices([event('spring-3', 6000)], { 'spring-3': 6500 });
    expect(prices.get('spring-3')).toBe(6500);
  });

  it('falls back to event prices when catalog is empty', () => {
    const prices = mergeTourPrices([event('spring-3', 6000)], {});
    expect(prices.get('spring-3')).toBe(6000);
  });
});
