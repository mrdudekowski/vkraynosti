import { describe, expect, it } from 'vitest';
import { mergeTourDataToSchedulePayload } from './mergeTourDataPayload';

describe('mergeTourDataToSchedulePayload', () => {
  const toursList = {
    schemaVersion: 1 as const,
    generatedAt: '2026-06-08T00:00:00.000Z',
    tours: [
      {
        id: 'summer-3',
        title: 'Остров',
        priceRub: 8500,
        durationType: 'однодневный' as const,
        publicationStatus: 'active' as const,
      },
      {
        id: 'summer-8',
        title: 'Анонс',
        priceRub: null,
        durationType: 'многодневный' as const,
        publicationStatus: 'in_development' as const,
      },
    ],
  };

  const schedule = {
    schemaVersion: 1 as const,
    generatedAt: '2026-06-08T00:00:00.000Z',
    events: [
      {
        date: '2026-07-18',
        tourId: 'summer-3',
        seats: 12,
        status: 'open' as const,
        comment: null,
      },
      {
        date: '2026-07-20',
        tourId: 'summer-8',
        seats: null,
        status: 'planned' as const,
        comment: null,
      },
    ],
  };

  it('merges catalog maps and hydrates active events only', () => {
    const payload = mergeTourDataToSchedulePayload(toursList, schedule);
    expect(payload.events).toHaveLength(1);
    expect(payload.events[0]).toMatchObject({
      tourId: 'summer-3',
      durationType: 'однодневный',
      priceRub: 8500,
    });
    expect(payload.catalogPublicationStatuses).toEqual({
      'summer-3': 'active',
      'summer-8': 'in_development',
    });
    expect(payload.catalogPrices['summer-3']).toBe(8500);
  });

  it('uses overridePriceRub when provided', () => {
    const payload = mergeTourDataToSchedulePayload(toursList, {
      ...schedule,
      events: [
        {
          date: '2026-07-18',
          tourId: 'summer-3',
          seats: 12,
          status: 'open',
          comment: null,
          overridePriceRub: 7900,
        },
      ],
    });
    expect(payload.events[0]?.priceRub).toBe(7900);
  });
});
