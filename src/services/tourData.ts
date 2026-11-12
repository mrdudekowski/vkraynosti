import { z } from 'zod';
import {
  buildCmsPublishedScheduleUrl,
  buildCmsPublishedToursListUrl,
  cmsTourScheduleBakeCandidates,
  resolveCmsContentBaseUrl,
} from '../cms/cmsContentUrls';
import type { SchedulePayload, TourDataFetchErrorCode, ToursListPayload } from '../types/tourData';
import { TourDataFetchError } from '../types/tourData';
import { mergeTourDataToSchedulePayload } from '../utils/tourData/mergeTourDataPayload';
import type { TourSchedulePayload } from '../types/tourSchedule';
import { loadEmbeddedPublicSnapshot } from '../cms/loadEmbeddedPublicSnapshot';

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

async function loadEmbeddedScheduleSnapshot(): Promise<{ toursList: ToursListPayload; schedule: SchedulePayload } | null> {
  let release;
  try {
    release = await loadEmbeddedPublicSnapshot();
  } catch (error) {
    throw new TourDataFetchError('parse', error instanceof Error ? error.message : 'CMS release is invalid');
  }
  if (release == null) return null;
  return {
    toursList: parseToursList(release.payload.toursList),
    schedule: parseSchedule(release.payload.schedule),
  };
}

async function loadLiveScheduleSnapshot(): Promise<{ toursList: ToursListPayload; schedule: SchedulePayload } | null> {
  const baseUrl = resolveCmsContentBaseUrl();
  if (baseUrl == null) return null;

  try {
    const [toursListInput, scheduleInput] = await Promise.all([
      fetchJson(buildCmsPublishedToursListUrl(baseUrl)),
      fetchJson(buildCmsPublishedScheduleUrl(baseUrl)),
    ]);
    return {
      toursList: parseToursList(toursListInput),
      schedule: parseSchedule(scheduleInput),
    };
  } catch (error) {
    console.warn('[tourSchedule] Live schedule failed; using deployed snapshot', error);
    return null;
  }
}

function bakedScheduleCandidates(): { toursList: string[]; schedule: string[] } {
  const candidates = cmsTourScheduleBakeCandidates();
  return { toursList: candidates.toursList, schedule: candidates.schedule };
}

export const loadToursList = async (): Promise<ToursListPayload> => {
  const baseUrl = resolveCmsContentBaseUrl();
  if (baseUrl != null) {
    try {
      return parseToursList(await fetchJson(buildCmsPublishedToursListUrl(baseUrl)));
    } catch (error) {
      console.warn('[tourSchedule] Live tour list failed; using deployed snapshot', error);
    }
  }
  const snapshot = await loadEmbeddedScheduleSnapshot();
  if (snapshot != null) return snapshot.toursList;
  return parseToursList(await fetchJsonFromCandidates(bakedScheduleCandidates().toursList));
};

export const loadSchedule = async (): Promise<SchedulePayload> => {
  const baseUrl = resolveCmsContentBaseUrl();
  if (baseUrl != null) {
    try {
      return parseSchedule(await fetchJson(buildCmsPublishedScheduleUrl(baseUrl)));
    } catch (error) {
      console.warn('[tourSchedule] Live schedule failed; using deployed snapshot', error);
    }
  }
  const snapshot = await loadEmbeddedScheduleSnapshot();
  if (snapshot != null) return snapshot.schedule;
  return parseSchedule(await fetchJsonFromCandidates(bakedScheduleCandidates().schedule));
};

export const loadTourSchedulePayload = async (): Promise<TourSchedulePayload> => {
  const live = await loadLiveScheduleSnapshot();
  if (live != null) return mergeTourDataToSchedulePayload(live.toursList, live.schedule);

  const snapshot = await loadEmbeddedScheduleSnapshot();
  if (snapshot != null) return mergeTourDataToSchedulePayload(snapshot.toursList, snapshot.schedule);

  const baked = bakedScheduleCandidates();
  const [toursList, schedule] = await Promise.all([
    fetchJsonFromCandidates(baked.toursList).then(parseToursList),
    fetchJsonFromCandidates(baked.schedule).then(parseSchedule),
  ]);
  return mergeTourDataToSchedulePayload(toursList, schedule);
};

export type { TourDataFetchErrorCode };
