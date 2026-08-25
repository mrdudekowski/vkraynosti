import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
} from '../../src/cms/cmsPackageKeys.ts';
import { TOUR_DATA_S3_PATHS } from '../../src/constants/tourDataUrls.ts';
import {
  parseSchedulePayload,
  parseToursListPayload,
} from '../../src/services/tourData.ts';
import { loadCmsApiEnv, readDotEnvFile } from './api/env.ts';
import { createCmsJsonStore } from './api/store.ts';

const rootDir = process.cwd();

function stripSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

async function readLocalScheduleFile(fileName: string): Promise<unknown | null> {
  const filePath = path.join(rootDir, 'public', 'data', 'tour-schedule', fileName);
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  } catch {
    return null;
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Fetch failed (${response.status}): ${url}`);
  }
  return response.json() as Promise<unknown>;
}

async function loadSourceJson(
  publicBase: string,
  relativePath: string,
  fileName: string
): Promise<unknown> {
  if (publicBase.length > 0) {
    return fetchJson(`${stripSlash(publicBase)}/${relativePath}`);
  }
  const local = await readLocalScheduleFile(fileName);
  if (local == null) {
    throw new Error(
      `No calendar source: set VITE_PUBLIC_S3_BASE_URL in .env.local or put public/data/tour-schedule/${fileName}`
    );
  }
  return local;
}

async function writeLocalCmsCopy(fileName: string, value: unknown): Promise<void> {
  const filePath = path.join(rootDir, 'public', 'data', 'cms', 'tour-schedule', fileName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  const localEnv = await readDotEnvFile(path.join(rootDir, '.env.local'));
  const cmsEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));
  const exampleEnv = await readDotEnvFile(path.join(rootDir, '.env'));
  const publicBase = (
    localEnv.VITE_PUBLIC_S3_BASE_URL ??
    exampleEnv.VITE_PUBLIC_S3_BASE_URL ??
    process.env.VITE_PUBLIC_S3_BASE_URL ??
    cmsEnv.CMS_SCHEDULE_SOURCE_BASE ??
    cmsEnv.CMS_MEDIA_SOURCE_BASE ??
    'https://4unja6slv5.cdn.twcstorage.ru/'
  ).trim();

  const toursList = parseToursListPayload(
    await loadSourceJson(publicBase, TOUR_DATA_S3_PATHS.toursList, 'tours_list.json')
  );
  const schedule = parseSchedulePayload(
    await loadSourceJson(publicBase, TOUR_DATA_S3_PATHS.schedule, 'schedule.json')
  );

  const cmsApiEnv = await loadCmsApiEnv(rootDir);
  const store = createCmsJsonStore(cmsApiEnv);
  await store.putJson(CMS_PUBLISHED_TOURS_LIST_KEY, toursList);
  await store.putJson(CMS_PUBLISHED_SCHEDULE_KEY, schedule);
  await writeLocalCmsCopy('tours_list.json', toursList);
  await writeLocalCmsCopy('schedule.json', schedule);

  console.log(
    `cms-dev calendar: ${toursList.tours.length} tours, ${schedule.events.length} events → ${CMS_PUBLISHED_TOURS_LIST_KEY}`
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
