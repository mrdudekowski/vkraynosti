import { describe, expect, it } from 'vitest';
import type { TourScheduleEvent } from '../../types/tourSchedule';
import {
  buildTourDepartureCalendarModel,
  isTourDepartureDate,
} from './buildTourDepartureCalendarModel';

const spring3Events: TourScheduleEvent[] = [
  {
    date: '2026-06-06',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
  },
  {
    date: '2026-06-07',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
  },
  {
    date: '2026-07-11',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
  },
];

describe('buildTourDepartureCalendarModel', () => {
  it('keeps sorted future dates and focus month from nearest departure', () => {
    const today = new Date(2026, 5, 1);
    const model = buildTourDepartureCalendarModel('spring-3', spring3Events, today);

    expect(model.futureDates).toEqual(['2026-06-06', '2026-06-07', '2026-07-11']);
    expect(model.nearestFuture).toBe('2026-06-06');
    expect(model.focusMonth.getFullYear()).toBe(2026);
    expect(model.focusMonth.getMonth()).toBe(5);
    expect(model.isArchive).toBe(false);
  });

  it('builds departure set and months across June and July', () => {
    const today = new Date(2026, 5, 1);
    const model = buildTourDepartureCalendarModel('spring-3', spring3Events, today);

    expect(model.departureDateSet.has('2026-06-06')).toBe(true);
    expect(model.departureDateSet.has('2026-07-11')).toBe(true);
    expect(model.departureDateSet.has('2026-08-01')).toBe(false);
    expect(model.monthsWithDepartures).toHaveLength(2);
    expect(model.monthsWithDepartures[0]?.getMonth()).toBe(5);
    expect(model.monthsWithDepartures[1]?.getMonth()).toBe(6);
  });

  it('returns empty model for tour without schedule events', () => {
    const today = new Date(2026, 5, 1);
    const model = buildTourDepartureCalendarModel('spring-3', [], today);

    expect(model.dates).toEqual([]);
    expect(model.futureDates).toEqual([]);
    expect(model.nearestFuture).toBeNull();
    expect(model.departureDateSet.size).toBe(0);
    expect(model.monthsWithDepartures).toEqual([]);
    expect(model.isArchive).toBe(false);
  });

  it('uses past dates for highlight and months when tour is archive', () => {
    const today = new Date(2026, 7, 1);
    const model = buildTourDepartureCalendarModel('spring-3', spring3Events, today);

    expect(model.futureDates).toEqual([]);
    expect(model.isArchive).toBe(true);
    expect([...model.departureDateSet].sort()).toEqual([
      '2026-06-06',
      '2026-06-07',
      '2026-07-11',
    ]);
    expect(model.monthsWithDepartures).toHaveLength(2);
  });

  it('ignores cancelled events', () => {
    const today = new Date(2026, 5, 1);
    const events: TourScheduleEvent[] = [
      ...spring3Events,
      {
        date: '2026-08-01',
        tourId: 'spring-3',
        durationType: 'однодневный',
        priceRub: 6000,
        seats: 0,
        status: 'cancelled',
        comment: null,
      },
    ];
    const model = buildTourDepartureCalendarModel('spring-3', events, today);

    expect(model.departureDateSet.has('2026-08-01')).toBe(false);
  });
});

describe('isTourDepartureDate', () => {
  it('returns true only for dates in the set', () => {
    const set = new Set(['2026-06-06', '2026-06-07']);
    expect(isTourDepartureDate('2026-06-06', set)).toBe(true);
    expect(isTourDepartureDate('2026-06-08', set)).toBe(false);
  });
});
