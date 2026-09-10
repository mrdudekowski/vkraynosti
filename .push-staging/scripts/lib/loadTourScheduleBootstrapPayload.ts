import { readTourCatalogFile } from './readTourCatalogFile.mjs';
import type { TourSchedulePayload } from '../../src/types/tourSchedule.ts';
import { mergeTourDataToSchedulePayload } from '../../src/utils/tourData/mergeTourDataPayload.ts';
import type { SchedulePayload, ToursListPayload } from '../../src/types/tourData.ts';

/** Build-time catalog snapshot for inline bootstrap (same merge as runtime fetch). */
export async function loadTourScheduleBootstrapPayload(
  rootDir: string,
): Promise<TourSchedulePayload> {
  const [listRaw, scheduleRaw] = await Promise.all([
    readTourCatalogFile(rootDir, 'tours_list.json'),
    readTourCatalogFile(rootDir, 'schedule.json'),
  ]);

  const toursList = JSON.parse(listRaw) as ToursListPayload;
  const schedule = JSON.parse(scheduleRaw) as SchedulePayload;
  return mergeTourDataToSchedulePayload(toursList, schedule);
}
