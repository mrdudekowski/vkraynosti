import { describe, expect, it } from 'vitest';
import type { TourScheduleEvent } from '../../types/tourSchedule';
import { filterEventsByPublicationStatuses } from './filterEventsByPublicationStatuses';

const event = (tourId: string): TourScheduleEvent => ({
  date: '2026-06-01',
  tourId,
  durationType: 'однодневный',
  priceRub: 1000,
  seats: null,
  status: 'open',
  comment: null,
});

describe('filterEventsByPublicationStatuses', () => {
  it('removes events for hidden tour ids', () => {
    const statuses = new Map([
      ['spring-1', 'active' as const],
      ['spring-2', 'hidden' as const],
    ]);

    const filtered = filterEventsByPublicationStatuses(
      [event('spring-1'), event('spring-2')],
      statuses,
    );

    expect(filtered.map(item => item.tourId)).toEqual(['spring-1']);
  });
});
