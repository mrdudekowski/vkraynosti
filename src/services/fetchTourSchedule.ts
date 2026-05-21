import { z } from 'zod';
import type { TourScheduleEvent } from '../types/tourSchedule';

const tourScheduleStatusSchema = z.enum(['planned', 'open', 'full', 'cancelled']);

const tourScheduleDurationTypeSchema = z.enum(['однодневный', 'многодневный']);

export const tourScheduleEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tourId: z.string().min(1),
  durationType: tourScheduleDurationTypeSchema,
  priceRub: z.number().nullable(),
  seats: z.number().nullable(),
  status: tourScheduleStatusSchema,
  comment: z.string().nullable(),
});

export const tourScheduleResponseSchema = z.union([
  z.array(tourScheduleEventSchema),
  z.object({ events: z.array(tourScheduleEventSchema) }),
]);

export type TourScheduleFetchErrorCode = 'network' | 'parse' | 'not-configured';

export class TourScheduleFetchError extends Error {
  readonly code: TourScheduleFetchErrorCode;

  constructor(code: TourScheduleFetchErrorCode, message: string) {
    super(message);
    this.name = 'TourScheduleFetchError';
    this.code = code;
  }
}

const tourScheduleEndpointUrl = import.meta.env.VITE_TOUR_SCHEDULE_ENDPOINT_URL;

const MOCK_SCHEDULE_URL = `${import.meta.env.BASE_URL}data/tour-schedule.json`;

const normalizeResponse = (parsed: z.infer<typeof tourScheduleResponseSchema>): TourScheduleEvent[] =>
  Array.isArray(parsed) ? parsed : parsed.events;

export const fetchTourSchedule = async (): Promise<TourScheduleEvent[]> => {
  const url = tourScheduleEndpointUrl?.trim() || MOCK_SCHEDULE_URL;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new TourScheduleFetchError('network', 'Failed to fetch tour schedule');
  }

  if (!response.ok) {
    throw new TourScheduleFetchError('network', `Tour schedule fetch failed: ${response.status}`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new TourScheduleFetchError('parse', 'Tour schedule response is not valid JSON');
  }

  const parsed = tourScheduleResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new TourScheduleFetchError('parse', 'Tour schedule response failed validation');
  }

  return normalizeResponse(parsed.data);
};
