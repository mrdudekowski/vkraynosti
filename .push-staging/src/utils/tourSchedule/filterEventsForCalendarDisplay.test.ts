import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';
import { getTourById } from '../../data/toursData';
import {
  filterEventsForCalendarDisplay,
  getCalendarMonthFloor,
} from './filterEventsForCalendarDisplay';

const spring3 = getTourById('spring-3');
if (!spring3) throw new Error('spring-3 missing');

const baseEvent = (overrides: Partial<EnrichedScheduleEvent>): EnrichedScheduleEvent => ({
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
  ...overrides,
});

describe('filterEventsForCalendarDisplay', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('drops events before current calendar month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20));

    const events = [
      baseEvent({ date: '2026-04-30', status: 'completed', statusLabel: 'Завершился' }),
      baseEvent({ date: '2026-05-05', status: 'completed', statusLabel: 'Завершился' }),
      baseEvent({ date: '2026-06-01' }),
    ];

    const filtered = filterEventsForCalendarDisplay(events);
    expect(filtered.map(e => e.date)).toEqual(['2026-05-05', '2026-06-01']);
  });

  it('drops completed events in future months', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20));

    const events = [
      baseEvent({ date: '2026-06-01', status: 'completed', statusLabel: 'Завершился' }),
      baseEvent({ date: '2026-06-07', status: 'open' }),
    ];

    const filtered = filterEventsForCalendarDisplay(events);
    expect(filtered.map(e => e.date)).toEqual(['2026-06-07']);
  });

  it('getCalendarMonthFloor is start of month', () => {
    expect(getCalendarMonthFloor(new Date(2026, 4, 20))).toEqual(new Date(2026, 4, 1));
  });
});
