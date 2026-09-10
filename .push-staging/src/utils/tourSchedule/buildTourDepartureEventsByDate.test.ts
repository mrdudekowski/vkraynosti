import { describe, expect, it } from 'vitest';
import { getTourById } from '../../data/toursData';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { buildTourDepartureEventsByDate } from './buildTourDepartureEventsByDate';

const spring3 = getTourById('spring-3');
if (!spring3) {
  throw new Error('spring-3 missing');
}

const enriched: EnrichedScheduleEvent[] = [
  {
    date: '2026-05-09',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
    season: 'spring',
    statusLabel: 'Набор открыт',
    tour: spring3,
  },
  {
    date: '2026-05-09',
    tourId: 'spring-6',
    durationType: 'однодневный',
    priceRub: 5500,
    seats: 12,
    status: 'open',
    comment: null,
    season: 'spring',
    statusLabel: 'Набор открыт',
    tour: getTourById('spring-6')!,
  },
  {
    date: '2026-06-01',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'cancelled',
    comment: null,
    season: 'spring',
    statusLabel: 'Отменён',
    tour: spring3,
  },
];

describe('buildTourDepartureEventsByDate', () => {
  it('groups only non-cancelled events for the tour', () => {
    const map = buildTourDepartureEventsByDate('spring-3', enriched);
    expect(map.size).toBe(1);
    expect(map.get('2026-05-09')).toHaveLength(1);
    expect(map.get('2026-05-09')?.[0]?.tourId).toBe('spring-3');
  });
});
