import {
  and,
  asc,
  eq,
  gte,
  inArray,
  lte,
  ne,
  notInArray,
  sql,
} from 'drizzle-orm';
import type { CmsTourDocument } from '../../../../src/cms/cmsTourDocument.ts';
import { departureEndDate } from '../../../../src/cms/departureDates.ts';
import { isTourDurationDays } from '../../../../src/cms/durationDays.ts';
import { isTourReady } from '../../../../src/cms/tourCompleteness.ts';
import type { CmsDatabase } from '../db/client.ts';
import type { DepartureStatus } from '../db/schema.ts';
import { tourDepartures } from '../db/schema.ts';
import { markCompleted as completedStatusForDate } from './completeDepartures.ts';

export type DepartureRecord = typeof tourDepartures.$inferSelect;
export type DepartureWithEndDate = DepartureRecord & { endsOn?: string };
export type LoadTourDocument = (tourId: string) => Promise<CmsTourDocument | null>;
export type EditableDepartureStatus = Exclude<DepartureStatus, 'completed'>;

export type CreateDepartureInput = {
  tourId: string;
  startsOn: string;
  seats?: number;
  actorUserId: string;
};

export type UpdateDepartureInput = {
  id: string;
  version: number;
  actorUserId: string;
  seats?: number;
  status?: EditableDepartureStatus;
  startsOn?: string;
};

export type ListDeparturesInput = {
  from: string;
  to: string;
  includeHistory: boolean;
};

export type DepartureRepository = {
  createDeparture(input: CreateDepartureInput): Promise<DepartureRecord>;
  updateDeparture(input: UpdateDepartureInput): Promise<DepartureRecord>;
  deleteDeparture(id: string, options?: { allowPublished?: boolean }): Promise<void>;
  listDepartures(input: ListDeparturesInput): Promise<DepartureWithEndDate[]>;
  listAllDepartures(): Promise<DepartureRecord[]>;
  markSubmitted(ids: string[], at: Date): Promise<void>;
  markUnsubmitted(ids: string[]): Promise<void>;
  markPublished(ids: string[], at: Date): Promise<void>;
  markCompleted(now: Date): Promise<number>;
};

export class CmsTourNotReadyError extends Error {
  readonly code = 'tour_not_ready' as const;

  constructor() {
    super('tour_not_ready');
    this.name = 'CmsTourNotReadyError';
  }
}

export class CmsDepartureDuplicateError extends Error {
  readonly code = 'departure_duplicate' as const;

  constructor() {
    super('departure_duplicate');
    this.name = 'CmsDepartureDuplicateError';
  }
}

export class CmsDepartureVersionConflictError extends Error {
  readonly code = 'version_conflict' as const;

  constructor() {
    super('version_conflict');
    this.name = 'CmsDepartureVersionConflictError';
  }
}

export class CmsDepartureCompletedError extends Error {
  readonly code = 'departure_completed' as const;

  constructor() {
    super('departure_completed');
    this.name = 'CmsDepartureCompletedError';
  }
}

export class CmsDeparturePublishedError extends Error {
  readonly code = 'departure_published' as const;

  constructor() {
    super('departure_published');
    this.name = 'CmsDeparturePublishedError';
  }
}

export class CmsInvalidStartsOnError extends Error {
  readonly code = 'invalid_starts_on' as const;

  constructor() {
    super('invalid_starts_on');
    this.name = 'CmsInvalidStartsOnError';
  }
}

export class CmsDepartureNotFoundError extends Error {
  readonly code = 'not_found' as const;

  constructor() {
    super('not_found');
    this.name = 'CmsDepartureNotFoundError';
  }
}

type RepositoryDependencies = {
  loadTourDocument: LoadTourDocument;
};

type DatabaseError = {
  code?: unknown;
  constraint_name?: unknown;
  cause?: unknown;
};

function isDepartureDuplicateError(error: unknown): boolean {
  if (typeof error !== 'object' || error == null) return false;
  const databaseError = error as DatabaseError;
  if (
    databaseError.code === '23505' &&
    databaseError.constraint_name === 'tour_departures_active_tour_starts_on_uq'
  ) {
    return true;
  }
  return databaseError.cause !== error && isDepartureDuplicateError(databaseError.cause);
}

async function withDepartureDuplicateMapping<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (isDepartureDuplicateError(error)) {
      throw new CmsDepartureDuplicateError();
    }
    throw error;
  }
}

export function isValidStartsOn(startsOn: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startsOn);
  if (match == null) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const isLeapYear = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day <= (daysInMonth[month - 1] ?? 0);
}

function assertValidStartsOn(startsOn: string): void {
  if (!isValidStartsOn(startsOn)) {
    throw new CmsInvalidStartsOnError();
  }
}

function assertEditableDepartureStatus(
  status: DepartureStatus | undefined,
): asserts status is EditableDepartureStatus | undefined {
  if (status === 'completed') {
    throw new CmsDepartureCompletedError();
  }
}

function endDateForTour(
  departure: DepartureRecord,
  tour: CmsTourDocument | null,
): DepartureWithEndDate {
  if (tour?.durationDays == null || !isTourDurationDays(tour.durationDays)) {
    return departure;
  }
  return {
    ...departure,
    endsOn: departureEndDate(departure.startsOn, tour.durationDays),
  };
}

export function createDepartureRepository(
  db: CmsDatabase,
  dependencies: RepositoryDependencies,
): DepartureRepository {
  const { loadTourDocument } = dependencies;

  return {
    async createDeparture(input) {
      assertValidStartsOn(input.startsOn);
      const tour = await loadTourDocument(input.tourId);
      if (tour == null || !isTourReady(tour)) {
        throw new CmsTourNotReadyError();
      }

      return withDepartureDuplicateMapping(async () => {
        const [departure] = await db
          .insert(tourDepartures)
          .values({
            tourId: input.tourId,
            startsOn: input.startsOn,
            seats: input.seats ?? 8,
            status: 'open',
            createdBy: input.actorUserId,
            updatedBy: input.actorUserId,
          })
          .returning();
        if (departure == null) {
          throw new Error('Departure creation did not return a record');
        }
        return departure;
      });
    },

    async updateDeparture(input) {
      assertEditableDepartureStatus(input.status);
      if (input.startsOn != null) {
        assertValidStartsOn(input.startsOn);
      }

      const patch = {
        ...(input.seats == null ? {} : { seats: input.seats }),
        ...(input.status == null ? {} : { status: input.status }),
        ...(input.startsOn == null ? {} : { startsOn: input.startsOn }),
        updatedBy: input.actorUserId,
        updatedAt: new Date(),
        version: sql`${tourDepartures.version} + 1`,
      };

      return withDepartureDuplicateMapping(() =>
        db.transaction(async (transaction) => {
          const [current] = await transaction
            .select({ status: tourDepartures.status })
            .from(tourDepartures)
            .where(eq(tourDepartures.id, input.id))
            .for('update');
          if (current?.status === 'completed') {
            throw new CmsDepartureCompletedError();
          }

          const [departure] = await transaction
            .update(tourDepartures)
            .set(patch)
            .where(and(eq(tourDepartures.id, input.id), eq(tourDepartures.version, input.version)))
            .returning();
          if (departure == null) {
            throw new CmsDepartureVersionConflictError();
          }
          return departure;
        }),
      );
    },

    async deleteDeparture(id, options) {
      const [current] = await db
        .select({ status: tourDepartures.status, publishedAt: tourDepartures.publishedAt })
        .from(tourDepartures)
        .where(eq(tourDepartures.id, id));
      if (current == null) {
        throw new CmsDepartureNotFoundError();
      }
      if (current.status === 'completed') {
        throw new CmsDepartureCompletedError();
      }
      if (current.publishedAt != null && options?.allowPublished !== true) {
        throw new CmsDeparturePublishedError();
      }
      await db.delete(tourDepartures).where(eq(tourDepartures.id, id));
    },

    async listDepartures(input) {
      const filters = [
        gte(tourDepartures.startsOn, input.from),
        lte(tourDepartures.startsOn, input.to),
      ];
      if (!input.includeHistory) {
        filters.push(ne(tourDepartures.status, 'completed'));
      }

      const departures = await db
        .select()
        .from(tourDepartures)
        .where(and(...filters))
        .orderBy(asc(tourDepartures.startsOn), asc(tourDepartures.id));
      const toursById = new Map<string, CmsTourDocument | null>();

      await Promise.all(
        [...new Set(departures.map((departure) => departure.tourId))].map(async (tourId) => {
          toursById.set(tourId, await loadTourDocument(tourId));
        }),
      );

      return departures.map((departure) =>
        endDateForTour(departure, toursById.get(departure.tourId) ?? null),
      );
    },

    async markCompleted(now) {
      const candidates = await db
        .select()
        .from(tourDepartures)
        .where(notInArray(tourDepartures.status, ['cancelled', 'completed']));
      const toursById = new Map<string, CmsTourDocument | null>();

      await Promise.all(
        [...new Set(candidates.map((departure) => departure.tourId))].map(async (tourId) => {
          toursById.set(tourId, await loadTourDocument(tourId));
        }),
      );

      let completedCount = 0;
      for (const departure of candidates) {
        const durationDays = toursById.get(departure.tourId)?.durationDays;
        if (durationDays == null || !isTourDurationDays(durationDays)) continue;
        if (
          completedStatusForDate(now, {
            startsOn: departure.startsOn,
            durationDays,
            status: departure.status,
          }) !== 'completed'
        ) {
          continue;
        }

        const updated = await db
          .update(tourDepartures)
          .set({
            status: 'completed',
            ...(departure.publishedAt != null
              ? { publishedStatus: 'completed' as const }
              : {}),
            updatedAt: now,
            version: sql`${tourDepartures.version} + 1`,
          })
          .where(
            and(
              eq(tourDepartures.id, departure.id),
              eq(tourDepartures.version, departure.version),
              ne(tourDepartures.status, 'cancelled'),
            ),
          )
          .returning({ id: tourDepartures.id });
        completedCount += updated.length;
      }
      return completedCount;
    },

    async listAllDepartures() {
      return db.select().from(tourDepartures).orderBy(asc(tourDepartures.startsOn), asc(tourDepartures.id));
    },

    async markSubmitted(ids, at) {
      if (ids.length === 0) {
        return;
      }
      await db
        .update(tourDepartures)
        .set({ submittedForPublishAt: at })
        .where(inArray(tourDepartures.id, ids));
    },

    async markUnsubmitted(ids) {
      if (ids.length === 0) {
        return;
      }
      await db
        .update(tourDepartures)
        .set({ submittedForPublishAt: null })
        .where(inArray(tourDepartures.id, ids));
    },

    async markPublished(ids, at) {
      if (ids.length === 0) {
        return;
      }
      await db
        .update(tourDepartures)
        .set({
          publishedAt: at,
          publishedStartsOn: sql`${tourDepartures.startsOn}`,
          publishedSeats: sql`${tourDepartures.seats}`,
          publishedStatus: sql`${tourDepartures.status}`,
        })
        .where(inArray(tourDepartures.id, ids));
    },
  };
}
