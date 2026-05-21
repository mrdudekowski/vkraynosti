import { describe, expect, it } from 'vitest';
import { getTourDepartureDates } from './getTourDepartureDates';
import type { TourScheduleEvent } from '../../types/tourSchedule';

const events: TourScheduleEvent[] = [
  {
    date: '2026-04-12',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
  },
  {
    date: '2026-05-10',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
  },
];

describe('getTourDepartureDates', () => {
  it('picks nearest future date and focus month', () => {
    const today = new Date(2026, 4, 8);
    const result = getTourDepartureDates('spring-3', events, today);

    expect(result.futureDates).toEqual(['2026-05-10']);
    expect(result.nearestFuture).toBe('2026-05-10');
    expect(result.focusMonth.getMonth()).toBe(4);
    expect(result.isArchive).toBe(false);
  });

  it('marks archive when all dates are in the past', () => {
    const today = new Date(2026, 5, 1);
    const result = getTourDepartureDates('spring-3', events, today);

    expect(result.futureDates).toEqual([]);
    expect(result.nearestFuture).toBeNull();
    expect(result.isArchive).toBe(true);
    expect(result.focusMonth.getMonth()).toBe(4);
  });

  it('deduplicates dates for the same tour', () => {
    const duplicateEvents: TourScheduleEvent[] = [
      ...events,
      {
        date: '2026-05-10',
        tourId: 'spring-3',
        durationType: 'однодневный',
        priceRub: 6500,
        seats: 4,
        status: 'open',
        comment: null,
      },
    ];
    const today = new Date(2026, 3, 1);
    const result = getTourDepartureDates('spring-3', duplicateEvents, today);

    expect(result.dates).toEqual(['2026-04-12', '2026-05-10']);
    expect(result.futureDates).toEqual(['2026-04-12', '2026-05-10']);
  });
});
