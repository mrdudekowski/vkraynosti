import { describe, expect, it } from 'vitest';
import type { CmsTourDocument } from './cmsTourDocument';
import { parseSchedulePayload, parseToursListPayload } from '../services/tourData';
import {
  departureNeedsPublication,
  documentForGuestPublish,
  documentToPublishForQueue,
  guestScheduleDeparturesFromSnapshots,
  livePublishQueue,
  nextSubmittedForPublishAt,
  toGuestSchedulePayload,
  toGuestTourDataFiles,
} from './publishQueue';

function readyTour(overrides: Partial<CmsTourDocument> = {}): CmsTourDocument {
  return {
    id: 'winter-1',
    slug: 'izubrinaya',
    season: 'winter',
    status: 'active',
    title: 'Изюбриная',
    subtitle: 'Зима',
    heroPhrase: 'Ели',
    description: 'лево',
    descriptionAside: 'право',
    duration: '1 день',
    durationDays: 1,
    difficulty: 'Medium',
    price: '6 000 ₽',
    program: [{ timeLabel: '04:30', description: 'Выезд' }],
    included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
    coverAssetId: 'cover',
    prefaceAssetId: 'preface',
    assets: [
      { id: 'cover', stillUrl: 'https://cdn.example/cover.webp', videoUrl: null, alt: '' },
      { id: 'preface', stillUrl: 'https://cdn.example/preface.webp', videoUrl: null, alt: '' },
      { id: 'g-0', stillUrl: 'https://cdn.example/g-0.webp', videoUrl: null, alt: '' },
    ],
    bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'g-0' }] }] },
    legacyGalleryVariant: null,
    ...overrides,
  };
}

describe('livePublishQueue', () => {
  it('does not expose departures whose tour is missing from the catalog', () => {
    const orphan = {
      id: 'orphan-departure', tourId: 'missing-tour', startsOn: '2026-09-19', seats: 10,
      status: 'open' as const, submittedForPublishAt: '2026-08-18T01:00:00.000Z',
      publishedAt: null, updatedAt: '2026-08-18T01:00:00.000Z',
    };
    expect(livePublishQueue([{
      id: 'winter-1', title: 'Изюбриная', document: readyTour(), meta: { rev: 1,
        updatedAt: '2026-08-18T00:00:00.000Z', editor: 'cms', submittedForPublishAt: null },
      published: true, publishedDocument: readyTour(),
    }], [orphan])).toEqual([]);
  });
  it('keeps a submitted unpublished tour even when it is not ready yet', () => {
    const submitted = {
      id: 'winter-1',
      title: 'Изюбриная',
      document: readyTour(),
      meta: {
        rev: 1,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'cms',
        submittedForPublishAt: '2026-08-18T01:00:00.000Z',
      },
      published: false,
    };
    expect(livePublishQueue([submitted], [])).toEqual([
      expect.objectContaining({
        kind: 'tour',
        id: 'winter-1',
        tourId: 'winter-1',
        title: 'Изюбриная',
        summary: 'new_tour',
        ready: true,
      }),
    ]);
    expect(
      livePublishQueue([{ ...submitted, document: readyTour({ descriptionAside: '' }) }], []),
    ).toEqual([
      expect.objectContaining({
        kind: 'tour',
        id: 'winter-1',
        ready: false,
      }),
    ]);
    expect(livePublishQueue([{ ...submitted, published: true }], [])).toEqual([]);
  });

  it('queues unpublished and dirty drafts even before an explicit submit', () => {
    const unpublished = {
      id: 'winter-2',
      title: 'Новый',
      document: readyTour({ id: 'winter-2', title: 'Новый' }),
      meta: {
        rev: 1,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'cms',
      },
      published: false,
    };
    const dirtyPublished = {
      id: 'winter-1',
      title: 'Изюбриная',
      document: readyTour({ price: '9 000 ₽' }),
      meta: {
        rev: 2,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'анна',
      },
      published: true,
      publishedDocument: readyTour(),
    };
    const returned = {
      ...unpublished,
      meta: {
        ...unpublished.meta,
        returnReason: 'Дополнить программу',
      },
    };
    expect(livePublishQueue([unpublished, dirtyPublished, returned], [])).toEqual([
      expect.objectContaining({ kind: 'tour', id: 'winter-2', summary: 'new_tour' }),
      expect.objectContaining({ kind: 'tour', id: 'winter-1', summary: 'tour_draft' }),
    ]);
  });

  it('keeps a submitted ready published tour when the draft differs from the snapshot', () => {
    const draft = readyTour({ price: '7 000 ₽' });
    const snapshot = readyTour({ price: '6 000 ₽' });
    const submitted = {
      id: 'winter-1',
      title: 'Изюбриная',
      document: draft,
      meta: {
        rev: 2,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'cms',
        submittedForPublishAt: '2026-08-18T01:00:00.000Z',
      },
      published: true,
      publishedDocument: snapshot,
    };
    expect(livePublishQueue([submitted], [])).toEqual([
      expect.objectContaining({
        kind: 'tour',
        id: 'winter-1',
        summary: 'tour_draft',
        price: '7 000 ₽',
        publishedPrice: '6 000 ₽',
        status: 'active',
        publishedStatus: 'active',
      }),
    ]);
  });

  it('exposes an active to hidden status change for publication review', () => {
    const submitted = {
      id: 'winter-1',
      title: 'Изюбриная',
      document: readyTour({ status: 'hidden' }),
      meta: {
        rev: 2,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'cms',
        submittedForPublishAt: '2026-08-18T01:00:00.000Z',
      },
      published: true,
      publishedDocument: readyTour({ status: 'active' }),
    };

    expect(livePublishQueue([submitted], [])).toEqual([
      expect.objectContaining({
        kind: 'tour',
        status: 'hidden',
        publishedStatus: 'active',
      }),
    ]);
  });

  it('marks an incomplete hide of a live tour as ready to publish', () => {
    const submitted = {
      id: 'winter-1',
      title: 'Изюбриная',
      document: readyTour({ status: 'hidden', subtitle: '' }),
      meta: {
        rev: 2,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'cms',
        submittedForPublishAt: '2026-08-18T01:00:00.000Z',
      },
      published: true,
      publishedDocument: readyTour({ status: 'active' }),
    };

    expect(livePublishQueue([submitted], [])).toEqual([
      expect.objectContaining({
        kind: 'tour',
        id: 'winter-1',
        ready: true,
        status: 'hidden',
        publishedStatus: 'active',
      }),
    ]);
  });

  it('drops a hidden tour from the queue once the snapshot is already hidden', () => {
    const hidden = {
      id: 'winter-1',
      title: 'Изюбриная',
      document: readyTour({ status: 'hidden', description: 'черновик' }),
      meta: {
        rev: 3,
        updatedAt: '2026-08-18T00:00:00.000Z',
        editor: 'cms',
        submittedForPublishAt: '2026-08-18T01:00:00.000Z',
      },
      published: true,
      publishedDocument: readyTour({ status: 'hidden' }),
    };

    expect(livePublishQueue([hidden], [])).toEqual([]);
  });

  it('keeps unpublished departure changes and ignores cancelled', () => {
    expect(
      livePublishQueue(
        [],
        [
          {
            id: 'd1',
            tourId: 'winter-1',
            startsOn: '2026-08-20',
            status: 'open',
            submittedForPublishAt: '2026-08-18T01:00:00.000Z',
            publishedAt: null,
            updatedAt: '2026-08-18T02:00:00.000Z',
            title: 'Изюбриная',
            author: 'петр',
          },
          {
            id: 'd2',
            tourId: 'winter-1',
            startsOn: '2026-08-21',
            status: 'cancelled',
            submittedForPublishAt: '2026-08-18T01:00:00.000Z',
            publishedAt: null,
            updatedAt: '2026-08-18T02:00:00.000Z',
          },
        ],
      ),
    ).toEqual([
      expect.objectContaining({
        kind: 'departure',
        id: 'd1',
        tourId: 'winter-1',
        startsOn: '2026-08-20',
        summary: 'new_departure',
        title: 'Изюбриная',
        author: 'петр',
      }),
    ]);
  });

  it('queues a cancelled date that is still on the guest snapshot', () => {
    expect(
      livePublishQueue(
        [],
        [
          {
            id: 'd3',
            tourId: 'winter-1',
            startsOn: '2026-08-22',
            seats: 8,
            status: 'cancelled',
            submittedForPublishAt: null,
            publishedAt: '2026-08-18T01:00:00.000Z',
            publishedStartsOn: '2026-08-22',
            publishedSeats: 8,
            publishedStatus: 'open',
            updatedAt: '2026-08-19T02:00:00.000Z',
            title: 'Изюбриная',
          },
        ],
      ),
    ).toEqual([
      expect.objectContaining({
        kind: 'departure',
        id: 'd3',
        summary: 'departure_draft',
        startsOn: '2026-08-22',
      }),
    ]);
  });
});
describe('departureNeedsPublication', () => {
  it('treats an unpublished open date as work and an unpublished cancel as nothing', () => {
    expect(
      departureNeedsPublication({
        startsOn: '2026-08-20',
        seats: 8,
        status: 'open',
        publishedAt: null,
        publishedStartsOn: null,
        publishedSeats: null,
        publishedStatus: null,
      }),
    ).toBe(true);
    expect(
      departureNeedsPublication({
        startsOn: '2026-08-20',
        seats: 8,
        status: 'cancelled',
        publishedAt: null,
        publishedStartsOn: null,
        publishedSeats: null,
        publishedStatus: null,
      }),
    ).toBe(false);
  });

  it('detects a working row that diverged from the snapshot', () => {
    expect(
      departureNeedsPublication({
        startsOn: '2026-08-21',
        seats: 6,
        status: 'open',
        publishedAt: '2026-08-18T00:00:00.000Z',
        publishedStartsOn: '2026-08-20',
        publishedSeats: 8,
        publishedStatus: 'open',
      }),
    ).toBe(true);
    expect(
      departureNeedsPublication({
        startsOn: '2026-08-20',
        seats: 8,
        status: 'open',
        publishedAt: '2026-08-18T00:00:00.000Z',
        publishedStartsOn: '2026-08-20',
        publishedSeats: 8,
        publishedStatus: 'open',
      }),
    ).toBe(false);
  });
});

describe('nextSubmittedForPublishAt', () => {
  it('queues a new unpublished tour and a changed published draft', () => {
    const nowIso = '2026-08-19T12:00:00.000Z';
    const draft = readyTour({ price: '9 000 ₽' });
    const published = readyTour();
    expect(
      nextSubmittedForPublishAt({
        draft,
        publishedDocument: null,
        currentSubmittedAt: null,
        nowIso,
      }),
    ).toBe(nowIso);
    expect(
      nextSubmittedForPublishAt({
        draft,
        publishedDocument: published,
        currentSubmittedAt: null,
        nowIso,
      }),
    ).toBe(nowIso);
    expect(
      nextSubmittedForPublishAt({
        draft,
        publishedDocument: published,
        currentSubmittedAt: '2026-08-18T01:00:00.000Z',
        nowIso,
      }),
    ).toBe('2026-08-18T01:00:00.000Z');
    expect(
      nextSubmittedForPublishAt({
        draft: published,
        publishedDocument: published,
        currentSubmittedAt: '2026-08-18T01:00:00.000Z',
        nowIso,
      }),
    ).toBeNull();
  });
});

describe('toGuestSchedulePayload', () => {
  it('omits planned and cancelled and hides future dates of a hidden tour', () => {
    const payload = toGuestSchedulePayload(
      [
        { tourId: 'winter-1', startsOn: '2026-08-10', seats: 8, status: 'completed' },
        { tourId: 'winter-1', startsOn: '2026-08-20', seats: 8, status: 'open' },
        { tourId: 'winter-1', startsOn: '2026-08-21', seats: 8, status: 'planned' },
        { tourId: 'winter-1', startsOn: '2026-08-22', seats: 8, status: 'cancelled' },
      ],
      [readyTour({ status: 'hidden' })],
      '2026-08-18',
    );
    expect(payload.events.map((event) => event.date)).toEqual(['2026-08-10']);
    expect(payload.events[0]?.status).toBe('completed');
  });

  it('includes open and full dates of a public tour', () => {
    const payload = toGuestSchedulePayload(
      [
        { tourId: 'winter-1', startsOn: '2026-08-20', seats: 8, status: 'open' },
        { tourId: 'winter-1', startsOn: '2026-08-21', seats: 8, status: 'full' },
      ],
      [readyTour()],
      '2026-08-18',
    );
    expect(payload.events.map((event) => event.status)).toEqual(['open', 'full']);
    expect(payload.catalogPrices['winter-1']).toBe(6000);
  });
});

describe('guestScheduleDeparturesFromSnapshots', () => {
  it('omits a departure that has no published snapshot', () => {
    expect(
      guestScheduleDeparturesFromSnapshots([
        {
          tourId: 'winter-1',
          startsOn: '2026-08-22',
          seats: 8,
          status: 'open',
          publishedAt: null,
          publishedStartsOn: null,
          publishedSeats: null,
          publishedStatus: null,
        },
      ]),
    ).toEqual([]);
  });

  it('uses snapshot fields when the working row has moved on', () => {
    expect(
      guestScheduleDeparturesFromSnapshots([
        {
          tourId: 'winter-1',
          startsOn: '2026-08-28',
          seats: 12,
          status: 'full',
          publishedAt: '2026-08-18T12:00:00.000Z',
          publishedStartsOn: '2026-08-20',
          publishedSeats: 8,
          publishedStatus: 'open',
        },
      ]),
    ).toEqual([
      {
        tourId: 'winter-1',
        startsOn: '2026-08-20',
        seats: 8,
        status: 'open',
      },
    ]);
  });
});

describe('toGuestTourDataFiles', () => {
  it('writes site-schema tours_list and schedule, omitting hidden tours', () => {
    const generatedAt = '2026-08-18T12:00:00.000Z';
    const files = toGuestTourDataFiles(
      [
        { tourId: 'winter-1', startsOn: '2026-08-20', seats: 8, status: 'open' },
        { tourId: 'winter-2', startsOn: '2026-08-21', seats: 8, status: 'planned' },
        { tourId: 'winter-3', startsOn: '2026-08-22', seats: 8, status: 'open' },
      ],
      [
        readyTour(),
        readyTour({
          id: 'winter-2',
          title: 'Голец',
          status: 'in_development',
        }),
        readyTour({
          id: 'winter-3',
          title: 'Скрытый',
          status: 'hidden',
        }),
      ],
      '2026-08-18',
      generatedAt,
    );

    const toursList = parseToursListPayload(files.toursList);
    const schedule = parseSchedulePayload(files.schedule);
    expect(toursList.generatedAt).toBe(generatedAt);
    expect(toursList.tours).toEqual([
      {
        id: 'winter-1',
        title: 'Изюбриная',
        priceRub: 6000,
        durationType: 'однодневный',
        publicationStatus: 'active',
      },
    ]);
    expect(schedule.events).toEqual([
      {
        date: '2026-08-20',
        tourId: 'winter-1',
        seats: 8,
        status: 'open',
        comment: null,
        durationType: 'однодневный',
        overridePriceRub: 6000,
      },
    ]);
  });

  it('keeps past dates of a hidden tour on the guest calendar', () => {
    const files = toGuestTourDataFiles(
      [
        { tourId: 'winter-3', startsOn: '2026-08-10', seats: 8, status: 'completed' },
        { tourId: 'winter-3', startsOn: '2026-08-22', seats: 8, status: 'open' },
      ],
      [readyTour({ id: 'winter-3', title: 'Скрытый', status: 'hidden' })],
      '2026-08-18',
      '2026-08-18T12:00:00.000Z',
    );

    expect(parseToursListPayload(files.toursList).tours).toEqual([]);
    expect(parseSchedulePayload(files.schedule).events).toEqual([
      {
        date: '2026-08-10',
        tourId: 'winter-3',
        seats: 8,
        status: 'completed',
        comment: null,
        durationType: 'однодневный',
        overridePriceRub: 6000,
      },
    ]);
  });
});

describe('documentToPublishForQueue', () => {
  it('hides a live tour from the last published card when the draft is incomplete', () => {
    const published = readyTour({ status: 'active', subtitle: 'Снимок' });
    const draft = readyTour({ status: 'hidden', subtitle: '', description: '' });
    expect(documentToPublishForQueue(draft, published)).toEqual(
      documentForGuestPublish({ ...published, status: 'hidden' }),
    );
  });

  it('publishes the ready hidden draft when the card is complete', () => {
    const published = readyTour({ status: 'active', description: 'сайт' });
    const draft = readyTour({ status: 'hidden', description: 'скрытая версия' });
    expect(documentToPublishForQueue(draft, published)).toEqual(documentForGuestPublish(draft));
  });
});

describe('documentForGuestPublish', () => {
  it('promotes a draft to active and leaves hidden and in_development as-is', () => {
    expect(documentForGuestPublish(readyTour({ status: 'draft' })).status).toBe('active');
    expect(documentForGuestPublish(readyTour({ status: 'hidden' })).status).toBe('hidden');
    expect(documentForGuestPublish(readyTour({ status: 'in_development' })).status).toBe(
      'in_development',
    );
  });
});

