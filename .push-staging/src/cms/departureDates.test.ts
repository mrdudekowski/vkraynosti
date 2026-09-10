import { describe, expect, it } from 'vitest';
import { departureEndDate } from './departureDates';

describe('departureEndDate', () => {
  it('computes end date from durationDays', () => {
    expect(departureEndDate('2026-08-15', 1)).toBe('2026-08-15');
    expect(departureEndDate('2026-08-15', 2)).toBe('2026-08-16');
  });
});
