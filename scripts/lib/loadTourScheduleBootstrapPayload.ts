import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { TourSchedulePayload } from '../../src/types/tourSchedule.ts';
import { mergeTourDataToSchedulePayload } from '../../src/utils/tourData/mergeTourDataPayload.ts';
import type { SchedulePayload, ToursListPayload } from '../../src/types/tourData.ts';

/** Build-time catalog snapshot for inline bootstrap (same merge as runtime fetch). */
export async function loadTourScheduleBootstrapPayload(
  rootDir: string,
): Promise<TourSchedulePayload> {
  const catalogDir = resolve(rootDir, 'public/data/tour-schedule');
  const [listRaw, scheduleRaw] = await Promise.all([
    readFile(resolve(catalogDir, 'tours_list.json'), 'utf8'),
    readFile(resolve(catalogDir, 'schedule.json'), 'utf8'),
  ]);

  const toursList = JSON.parse(listRaw) as ToursListPayload;
  const schedule = JSON.parse(scheduleRaw) as SchedulePayload;
  return mergeTourDataToSchedulePayload(toursList, schedule);
}
