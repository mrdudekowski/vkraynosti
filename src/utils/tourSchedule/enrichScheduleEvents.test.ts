import { describe, expect, it, vi } from 'vitest';
import { enrichScheduleEvents } from './enrichScheduleEvents';
import type { TourScheduleEvent } from '../../types/tourSchedule';

describe('enrichScheduleEvents', () => {
  it('filters cancelled events', () => {
    const events: TourScheduleEvent[] = [
      {
        date: '2026-05-09',
        tourId: 'spring-3',
        durationType: 'однодневный',
        priceRub: 6000,
        seats: 8,
        status: 'cancelled',
        comment: null,
      },
    ];

    expect(enrichScheduleEvents(events)).toHaveLength(0);
  });

  it('skips unknown tourId with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const events: TourScheduleEvent[] = [
      {
        date: '2026-05-09',
        tourId: 'unknown-tour-id',
        durationType: 'однодневный',
        priceRub: 1000,
        seats: null,
        status: 'open',
        comment: null,
      },
    ];

    expect(enrichScheduleEvents(events)).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('enriches known tour', () => {
    const events: TourScheduleEvent[] = [
      {
        date: '2026-05-09',
        tourId: 'spring-3',
        durationType: 'однодневный',
        priceRub: 6000,
        seats: 8,
        status: 'open',
        comment: null,
      },
    ];

    const enriched = enrichScheduleEvents(events);
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.tour.id).toBe('spring-3');
    expect(enriched[0]?.statusLabel).toBe('Набор открыт');
  });
});
