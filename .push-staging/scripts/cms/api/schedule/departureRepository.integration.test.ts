/** @vitest-environment node */
import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { inArray } from 'drizzle-orm';
import type { CmsTourDocument } from '../../../../src/cms/cmsTourDocument.ts';
import { createDatabase } from '../db/client.ts';
import { tourDepartures, users } from '../db/schema.ts';
import { createDepartureRepository } from './departureRepository.ts';

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (testDatabaseUrl == null || testDatabaseUrl.trim() === '') {
  throw new Error('TEST_DATABASE_URL is required for departure repository integration tests');
}

const testDatabase = new URL(testDatabaseUrl);
if (!['127.0.0.1', 'localhost'].includes(testDatabase.hostname)) {
  throw new Error('TEST_DATABASE_URL must point to a local database');
}

const testRunPrefix = `task4-${randomUUID().replaceAll('-', '')}`;
const database = createDatabase({ url: testDatabaseUrl, ssl: false, maxConnections: 1 });
const createdDepartureIds = new Set<string>();
const createdUserIds = new Set<string>();
let actorUserId = '';

function readyTour(overrides: Partial<CmsTourDocument> = {}): CmsTourDocument {
  return {
    id: 'winter-1',
    slug: 'izubrinaya',
    season: 'winter',
    status: 'draft',
    title: 'Изюбриная',
    subtitle: 'Зима',
    heroPhrase: 'Ели',
    description: 'лево',
    descriptionAside: 'право',
    duration: '2 дня',
    durationDays: 2,
    difficulty: 'Medium',
    price: 'по запросу',
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

const tourDocuments = new Map<string, CmsTourDocument>([
  ['winter-1', readyTour()],
  ['winter-incomplete', readyTour({ id: 'winter-incomplete', subtitle: '' })],
  ['winter-variable-duration', readyTour({ id: 'winter-variable-duration' })],
]);
const repository = createDepartureRepository(database.db, {
  loadTourDocument: async (tourId) => tourDocuments.get(tourId) ?? null,
});

async function createTestDeparture(input: {
  tourId?: string;
  startsOn: string;
  seats?: number;
}) {
  const departure = await repository.createDeparture({
    tourId: input.tourId ?? 'winter-1',
    startsOn: input.startsOn,
    seats: input.seats,
    actorUserId,
  });
  createdDepartureIds.add(departure.id);
  return departure;
}

beforeEach(async () => {
  const [actor] = await database.db
    .insert(users)
    .values({
      login: `${testRunPrefix}-${randomUUID().slice(0, 12)}`,
      passwordHash: 'hash',
      role: 'editor',
    })
    .returning();
  if (actor == null) throw new Error('Test actor creation did not return a record');
  actorUserId = actor.id;
  createdUserIds.add(actor.id);
});

afterEach(async () => {
  if (createdDepartureIds.size > 0) {
    await database.db.delete(tourDepartures).where(inArray(tourDepartures.id, [...createdDepartureIds]));
    createdDepartureIds.clear();
  }
  if (createdUserIds.size > 0) {
    await database.db.delete(users).where(inArray(users.id, [...createdUserIds]));
    createdUserIds.clear();
  }
});

afterAll(async () => {
  await database.close();
});

describe('DepartureRepository', () => {
  it('creates an open departure with eight seats by default', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-10' });

    expect(departure).toMatchObject({
      tourId: 'winter-1',
      startsOn: '2031-01-10',
      seats: 8,
      status: 'open',
      version: 1,
      createdBy: actorUserId,
      updatedBy: actorUserId,
      publishedAt: null,
      publishedStartsOn: null,
      publishedSeats: null,
      publishedStatus: null,
    });
  });

  it('copies working date seats and status into the published snapshot', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-12', seats: 10 });
    const at = new Date('2031-01-01T00:00:00.000Z');
    await repository.markPublished([departure.id], at);
    const [published] = await repository.listDepartures({
      from: '2031-01-12',
      to: '2031-01-12',
      includeHistory: true,
    });
    expect(published).toMatchObject({
      id: departure.id,
      startsOn: '2031-01-12',
      seats: 10,
      status: 'open',
      publishedStartsOn: '2031-01-12',
      publishedSeats: 10,
      publishedStatus: 'open',
    });
    expect(published?.publishedAt).not.toBeNull();
  });

  it('rejects a duplicate active tour start date', async () => {
    await createTestDeparture({ startsOn: '2031-01-11' });

    await expect(createTestDeparture({ startsOn: '2031-01-11' })).rejects.toMatchObject({
      code: 'departure_duplicate',
    });
  });

  it.each(['2031-1-2', '2031/01/02', '2031-02-30'])(
    'rejects invalid start date %s without persisting it',
    async (startsOn) => {
      const before = await repository.listDepartures({
        from: '0001-01-01',
        to: '9999-12-31',
        includeHistory: true,
      });

      await expect(createTestDeparture({ startsOn })).rejects.toMatchObject({
        code: 'invalid_starts_on',
      });

      expect(
        await repository.listDepartures({
          from: '0001-01-01',
          to: '9999-12-31',
          includeHistory: true,
        }),
      ).toEqual(before);
    },
  );

  it('rejects an update with a stale version', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-12' });
    const updated = await repository.updateDeparture({
      id: departure.id,
      version: departure.version,
      actorUserId,
      status: 'full',
    });

    await expect(
      repository.updateDeparture({
        id: departure.id,
        version: departure.version,
        actorUserId,
        seats: 10,
      }),
    ).rejects.toMatchObject({ code: 'version_conflict' });
    expect(updated).toMatchObject({ status: 'full', version: 2, updatedBy: actorUserId });
  });

  it('rejects setting completed through updateDeparture', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-15' });

    await expect(
      repository.updateDeparture({
        id: departure.id,
        version: departure.version,
        actorUserId,
        status: 'completed' as never,
      }),
    ).rejects.toMatchObject({ code: 'departure_completed' });

    const [persisted] = await repository.listDepartures({
      from: departure.startsOn,
      to: departure.startsOn,
      includeHistory: true,
    });
    expect(persisted).toMatchObject({ id: departure.id, status: 'open', version: 1 });
  });

  it('rejects every update to a completed departure', async () => {
    const departure = await createTestDeparture({ startsOn: '2026-08-10' });
    expect(await repository.markCompleted(new Date('2026-08-17T15:30:00.000Z'))).toBe(1);

    await expect(
      repository.updateDeparture({
        id: departure.id,
        version: departure.version + 1,
        actorUserId,
        seats: 12,
        startsOn: '2031-01-16',
        status: 'open',
      }),
    ).rejects.toMatchObject({ code: 'departure_completed' });

    const [persisted] = await repository.listDepartures({
      from: departure.startsOn,
      to: departure.startsOn,
      includeHistory: true,
    });
    expect(persisted).toMatchObject({
      id: departure.id,
      startsOn: departure.startsOn,
      seats: departure.seats,
      status: 'completed',
      version: 2,
    });
  });

  it('rejects an invalid start date when moving a departure', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-17' });

    await expect(
      repository.updateDeparture({
        id: departure.id,
        version: departure.version,
        actorUserId,
        startsOn: '2031-02-30',
      }),
    ).rejects.toMatchObject({ code: 'invalid_starts_on' });

    const [persisted] = await repository.listDepartures({
      from: departure.startsOn,
      to: departure.startsOn,
      includeHistory: true,
    });
    expect(persisted).toMatchObject({ id: departure.id, startsOn: departure.startsOn, version: 1 });
  });

  it('rejects a departure for an incomplete tour without persisting it', async () => {
    await expect(
      repository.createDeparture({
        tourId: 'winter-incomplete',
        startsOn: '2031-01-13',
        actorUserId,
      }),
    ).rejects.toMatchObject({ code: 'tour_not_ready' });

    expect(
      await repository.listDepartures({
        from: '2031-01-13',
        to: '2031-01-13',
        includeHistory: true,
      }),
    ).toEqual([]);
  });

  it('computes the moved departure end date from the tour duration', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-14' });
    const moved = await repository.updateDeparture({
      id: departure.id,
      version: departure.version,
      actorUserId,
      startsOn: '2031-01-20',
    });

    const listed = await repository.listDepartures({
      from: '2031-01-20',
      to: '2031-01-20',
      includeHistory: false,
    });

    expect(moved).toMatchObject({ startsOn: '2031-01-20', version: 2 });
    expect(listed).toEqual([expect.objectContaining({ id: departure.id, endsOn: '2031-01-21' })]);
  });

  it('rejects moving a departure onto another active start for the same tour', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-01-21' });
    await createTestDeparture({ startsOn: '2031-01-22' });

    await expect(
      repository.updateDeparture({
        id: departure.id,
        version: departure.version,
        actorUserId,
        startsOn: '2031-01-22',
      }),
    ).rejects.toMatchObject({ code: 'departure_duplicate' });
  });

  it('marks ended departures completed but leaves cancelled departures unchanged', async () => {
    const ended = await createTestDeparture({ startsOn: '2026-08-15' });
    const cancelled = await createTestDeparture({ startsOn: '2026-08-14' });
    const cancelledUpdate = await repository.updateDeparture({
      id: cancelled.id,
      version: cancelled.version,
      actorUserId,
      status: 'cancelled',
    });

    createdDepartureIds.add(cancelledUpdate.id);
    expect(await repository.markCompleted(new Date('2026-08-17T15:30:00.000Z'))).toBe(1);

    const listed = await repository.listDepartures({
      from: '2026-08-14',
      to: '2026-08-15',
      includeHistory: true,
    });
    expect(listed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ended.id, status: 'completed' }),
        expect.objectContaining({ id: cancelled.id, status: 'cancelled' }),
      ]),
    );
  });

  it('omits completed history while retaining every other status in range', async () => {
    await createTestDeparture({ startsOn: '2026-08-10' });
    expect(await repository.markCompleted(new Date('2026-08-17T15:30:00.000Z'))).toBe(1);

    const planned = await createTestDeparture({ startsOn: '2031-02-01' });
    const open = await createTestDeparture({ startsOn: '2031-02-02' });
    const full = await createTestDeparture({ startsOn: '2031-02-03' });
    const cancelled = await createTestDeparture({ startsOn: '2031-02-04' });
    await repository.updateDeparture({
      id: planned.id,
      version: planned.version,
      actorUserId,
      status: 'planned',
    });
    await repository.updateDeparture({
      id: full.id,
      version: full.version,
      actorUserId,
      status: 'full',
    });
    await repository.updateDeparture({
      id: cancelled.id,
      version: cancelled.version,
      actorUserId,
      status: 'cancelled',
    });

    const listed = await repository.listDepartures({
      from: '2026-08-10',
      to: '2031-02-04',
      includeHistory: false,
    });
    const ours = listed.filter((departure) => createdDepartureIds.has(departure.id));

    expect(ours.map(({ status }) => status)).toEqual(['planned', 'open', 'full', 'cancelled']);
    expect(ours.map(({ id }) => id)).toContain(open.id);
  });

  it('does not complete a departure whose tour has no valid durationDays', async () => {
    const departure = await createTestDeparture({
      tourId: 'winter-variable-duration',
      startsOn: '2026-08-10',
    });
    tourDocuments.set(
      'winter-variable-duration',
      readyTour({ id: 'winter-variable-duration', durationDays: 0 }),
    );

    try {
      expect(await repository.markCompleted(new Date('2026-08-17T15:30:00.000Z'))).toBe(0);
      const [persisted] = await repository.listDepartures({
        from: departure.startsOn,
        to: departure.startsOn,
        includeHistory: true,
      });
      expect(persisted).toMatchObject({ id: departure.id, status: 'open', version: 1 });
    } finally {
      tourDocuments.set(
        'winter-variable-duration',
        readyTour({ id: 'winter-variable-duration' }),
      );
    }
  });

  it('deletes an open departure and rejects a missing id', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-03-01' });
    await repository.deleteDeparture(departure.id);
    const listed = await repository.listDepartures({
      from: '2031-03-01',
      to: '2031-03-01',
      includeHistory: true,
    });
    expect(listed.map((item) => item.id)).not.toContain(departure.id);

    await expect(repository.deleteDeparture(randomUUID())).rejects.toMatchObject({ code: 'not_found' });
  });

  it('rejects deleting a published snapshot unless hide explicitly allows it', async () => {
    const departure = await createTestDeparture({ startsOn: '2031-03-02' });
    await repository.markPublished([departure.id], new Date('2031-01-01T00:00:00.000Z'));
    await expect(repository.deleteDeparture(departure.id)).rejects.toMatchObject({
      code: 'departure_published',
    });
    await repository.deleteDeparture(departure.id, { allowPublished: true });
    const listed = await repository.listDepartures({
      from: '2031-03-02',
      to: '2031-03-02',
      includeHistory: true,
    });
    expect(listed.map((item) => item.id)).not.toContain(departure.id);
  });
});
