import { describe, expect, it } from 'vitest';
import { groupEventsByIsoDate } from './groupEventsByIsoDate';
import type { EnrichedScheduleEvent } from '../../types/tourSchedule';

const sampleEvent = (overrides: Partial<EnrichedScheduleEvent>): EnrichedScheduleEvent =>
  ({
    date: '2026-05-09',
    tourId: 'spring-3',
    durationType: 'однодневный',
    priceRub: 6000,
    seats: 8,
    status: 'open',
    comment: null,
    season: 'spring',
    statusLabel: 'Набор открыт',
    tour: {
      id: 'spring-3',
      season: 'spring',
      title: 'Test',
      subtitle: 'Sub',
      heroPhrase: 'Hero',
      duration: '1 день',
      difficulty: 'Easy',
      price: '6000 ₽',
      description: 'Desc',
      imageUrl: '/tours/spring-3/cover.webp',
      program: [],
      included: [],
    },
    ...overrides,
  }) as EnrichedScheduleEvent;

describe('groupEventsByIsoDate', () => {
  it('groups events by ISO date', () => {
    const events = [
      sampleEvent({ date: '2026-05-09', tourId: 'spring-3' }),
      sampleEvent({ date: '2026-05-09', tourId: 'spring-6' }),
      sampleEvent({ date: '2026-05-10', tourId: 'spring-3' }),
    ];

    const map = groupEventsByIsoDate(events);

    expect(map.get('2026-05-09')).toHaveLength(2);
    expect(map.get('2026-05-10')).toHaveLength(1);
  });

  it('returns empty map for empty input', () => {
    expect(groupEventsByIsoDate([])).toEqual(new Map());
  });
});
