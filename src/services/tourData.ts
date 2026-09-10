import { z } from 'zod';
import { cmsTourScheduleOverlayCandidates } from '../cms/cmsContentUrls';
import { TOUR_DATA_S3_PATHS, buildTourDataFileUrl } from '../constants/tourDataUrls';
import type { SchedulePayload, TourDataFetchErrorCode, ToursListPayload } from '../types/tourData';
import { TourDataFetchError } from '../types/tourData';
import { mergeTourDataToSchedulePayload } from '../utils/tourData/mergeTourDataPayload';
import type { TourSchedulePayload } from '../types/tourSchedule';

const tourSchema = z.object({
  id: z.string().regex(/^[a-z]+-\d+$/),
  title: z.string().min(1),
  priceRub: z.number().nonnegative().nullable(),
  durationType: z.enum(['однодневный', 'многодневный']),
  publicationStatus: z.enum(['active', 'in_development']),
});

const toursListSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: z.string().min(1),
    tours: z.array(tourSchema),
  })
  .strict();

const scheduleEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tourId: z.string().regex(/^[a-z]+-\d+$/),
  seats: z.number().int().nonnegative().nullable(),
  status: z.enum(['planned', 'open', 'full', 'cancelled', 'completed']),
  comment: z.string().nullable(),
  overridePriceRub: z.number().nonnegative().optional(),
  durationType: z.enum(['однодневный', 'многодневный']).optional(),
});

const scheduleSchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: z.string().min(1),
    events: z.array(scheduleEventSchema),
  })
  .strict();

const fetchJson = async (url: string): Promise<unknown> => {
  let response: Response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch {
    throw new TourDataFetchError('network', `Failed to fetch ${url}`);
  }

  if (!response.ok) {
    throw new TourDataFetchError('network', `Fetch failed (${response.status}): ${url}`);
  }

  try {
    return await response.json();
  } catch {
    throw new TourDataFetchError('parse', `Response is not valid JSON: ${url}`);
  }
};

const parseToursList = (json: unknown): ToursListPayload => {
  const parsed = toursListSchema.safeParse(json);
  if (!parsed.success) {
    throw new TourDataFetchError('parse', 'tours_list.json has invalid structure');
  }
  return parsed.data;
};

const parseSchedule = (json: unknown): SchedulePayload => {
  const parsed = scheduleSchema.safeParse(json);
  if (!parsed.success) {
    throw new TourDataFetchError('parse', 'schedule.json has invalid structure');
  }
  return parsed.data;
};

export { parseToursList as parseToursListPayload, parseSchedule as parseSchedulePayload };

async function fetchJsonFromCandidates(urls: string[]): Promise<unknown> {
  let lastError: TourDataFetchError | null = null;
  for (const url of urls) {
    try {
      return await fetchJson(url);
    } catch (error) {
      lastError =
        error instanceof TourDataFetchError
          ? error
          : new TourDataFetchError('network', `Failed to fetch ${url}`);
    }
  }
  throw lastError ?? new TourDataFetchError('network', 'No calendar JSON candidates');
}

function toursListUrls(): string[] {
  const overlay = cmsTourScheduleOverlayCandidates().toursList;
  if (overlay.length > 0) {
    return overlay;
  }
  return [buildTourDataFileUrl(TOUR_DATA_S3_PATHS.toursList)];
}

function scheduleUrls(): string[] {
  const overlay = cmsTourScheduleOverlayCandidates().schedule;
  if (overlay.length > 0) {
    return overlay;
  }
  return [buildTourDataFileUrl(TOUR_DATA_S3_PATHS.schedule)];
}

export const loadToursList = async (): Promise<ToursListPayload> =>
  parseToursList(await fetchJsonFromCandidates(toursListUrls()));

export const loadSchedule = async (): Promise<SchedulePayload> =>
  parseSchedule(await fetchJsonFromCandidates(scheduleUrls()));

export const loadTourSchedulePayload = async (): Promise<TourSchedulePayload> => {
  const [toursList, schedule] = await Promise.all([loadToursList(), loadSchedule()]);
  return mergeTourDataToSchedulePayload(toursList, schedule);
};

export type { TourDataFetchErrorCode };
