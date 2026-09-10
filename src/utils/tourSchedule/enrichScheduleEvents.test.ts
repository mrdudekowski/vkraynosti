import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Tour } from '../../types';
import { clearCmsTourOverlay, setCmsTourOverlay } from '../../cms/cmsTourOverlay';
import { enrichScheduleEvents } from './enrichScheduleEvents';
import type { TourScheduleEvent } from '../../types/tourSchedule';

const overlayTour = (id: string): Tour => ({
  id,
  slug: `${id}-cms`,
  season: 'summer',
  title: `CMS ${id}`,
  subtitle: '',
  heroPhrase: id,
  duration: '1 день',
  difficulty: 'Easy',
  price: 'по запросу',
  description: '',
  program: [],
  includedInPrice: [],
  imageUrl: '/x.webp',
  galleryImages: ['/x.webp'],
});

describe('enrichScheduleEvents', () => {
  afterEach(() => {
    clearCmsTourOverlay();
  });
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

    expect(
      enrichScheduleEvents(events, new Map([['unknown-tour-id', 'active' as const]])),
    ).toHaveLength(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('enriches completed tour', () => {
    const events: TourScheduleEvent[] = [
      {
        date: '2026-05-09',
        tourId: 'spring-3',
        durationType: 'однодневный',
        priceRub: 6000,
        seats: 8,
        status: 'completed',
        comment: null,
      },
    ];

    const enriched = enrichScheduleEvents(
      events,
      new Map([['spring-3', 'active' as const]]),
    );
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.statusLabel).toBe('Завершился');
  });

  it('keeps a completed date of a hidden tour', () => {
    const events: TourScheduleEvent[] = [
      {
        date: '2026-05-09',
        tourId: 'spring-3',
        durationType: 'однодневный',
        priceRub: 6000,
        seats: 8,
        status: 'completed',
        comment: null,
      },
    ];
    const publicationStatuses = new Map([['spring-3', 'hidden' as const]]);

    const enriched = enrichScheduleEvents(events, publicationStatuses);
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.status).toBe('completed');
    expect(enriched[0]?.tour.id).toBe('spring-3');
  });

  it('skips hidden tours', () => {
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
    const publicationStatuses = new Map([
      ['spring-3', 'hidden' as const],
    ]);

    expect(enrichScheduleEvents(events, publicationStatuses)).toHaveLength(0);
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

    const enriched = enrichScheduleEvents(
      events,
      new Map([['spring-3', 'active' as const]]),
    );
    expect(enriched[0]?.statusLabel).toBe('Набор открыт');
  });

  it('при активном overlay обогащает CMS-only и пропускает туры только из кода', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setCmsTourOverlay([overlayTour('cms-only-fixture')]);
    const events: TourScheduleEvent[] = [
      {
        date: '2026-05-09',
        tourId: 'cms-only-fixture',
        durationType: 'однодневный',
        priceRub: 1000,
        seats: 8,
        status: 'open',
        comment: null,
      },
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
    const publicationStatuses = new Map([
      ['cms-only-fixture', 'active' as const],
      ['spring-3', 'active' as const],
    ]);

    const enriched = enrichScheduleEvents(events, publicationStatuses);
    expect(enriched).toHaveLength(1);
    expect(enriched[0]?.tourId).toBe('cms-only-fixture');
    expect(enriched[0]?.tour.title).toBe('CMS cms-only-fixture');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
