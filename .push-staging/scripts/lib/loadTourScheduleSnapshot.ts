import { readTourCatalogFile } from './readTourCatalogFile.mjs';
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
  const [listRaw, scheduleRaw] = await Promise.all([
    readTourCatalogFile(rootDir, 'tours_list.json'),
    readTourCatalogFile(rootDir, 'schedule.json'),
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
