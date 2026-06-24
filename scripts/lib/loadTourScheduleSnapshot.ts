import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type {
  TourPublicationStatus,
  TourScheduleDurationType,
  TourScheduleEvent,
} from '../../src/types/tourSchedule.ts';

export interface TourScheduleSnapshot {
  events: TourScheduleEvent[];
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>;
  catalogPrices: ReadonlyMap<string, number>;
  durationTypes: ReadonlyMap<string, TourScheduleDurationType>;
}

/** Snapshot from `public/data/tour-schedule/` (same source as runtime + sitemap). */
export async function loadTourScheduleSnapshot(rootDir: string): Promise<TourScheduleSnapshot> {
  const catalogDir = resolve(rootDir, 'public/data/tour-schedule');
  const [listRaw, scheduleRaw] = await Promise.all([
    readFile(resolve(catalogDir, 'tours_list.json'), 'utf8'),
    readFile(resolve(catalogDir, 'schedule.json'), 'utf8'),
  ]);

  const list = JSON.parse(listRaw) as {
    tours?: Array<{
      id?: string;
      priceRub?: number;
      durationType?: TourScheduleDurationType;
      publicationStatus?: TourPublicationStatus;
    }>;
  };
  const schedule = JSON.parse(scheduleRaw) as { events?: TourScheduleEvent[] };

  const publicationStatuses = new Map<string, TourPublicationStatus>();
  const catalogPrices = new Map<string, number>();
  const durationTypes = new Map<string, TourScheduleDurationType>();

  for (const tour of list.tours ?? []) {
    if (!tour?.id) continue;
    if (tour.publicationStatus) {
      publicationStatuses.set(tour.id, tour.publicationStatus);
    }
    if (typeof tour.priceRub === 'number') {
      catalogPrices.set(tour.id, tour.priceRub);
    }
    if (tour.durationType) {
      durationTypes.set(tour.id, tour.durationType);
    }
  }

  return {
    events: schedule.events ?? [],
    publicationStatuses,
    catalogPrices,
    durationTypes,
  };
}
