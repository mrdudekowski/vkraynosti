import { describe, expect, it } from 'vitest';
import { getTourById } from '../../data/toursData';
import { monthHasEvents } from './monthHasEvents';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';

const spring3 = getTourById('spring-3');
if (!spring3) throw new Error('spring-3 missing');

const event = (date: string): EnrichedScheduleEvent => ({
  date,
  tourId: 'spring-3',
  durationType: 'однодневный',
  priceRub: 6000,
  seats: 8,
  status: 'open',
  comment: null,
  season: 'spring',
  statusLabel: 'Набор открыт',
  tour: spring3,
});

describe('monthHasEvents', () => {
  it('returns true when events exist in month', () => {
    expect(monthHasEvents(2026, 4, [event('2026-05-09')])).toBe(true);
  });

  it('returns false for empty month', () => {
    expect(monthHasEvents(2026, 6, [event('2026-05-09')])).toBe(false);
  });
});
