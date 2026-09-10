/**
 * @deprecated Используйте `loadTourSchedulePayload` из `./tourData`.
 * Оставлено для обратной совместимости тестов и старых импортов.
 */
import { loadTourSchedulePayload } from './tourData';
import type { TourSchedulePayload } from '../types/tourSchedule';
import { TourDataFetchError } from '../types/tourData';

export type TourScheduleFetchErrorCode = 'network' | 'parse' | 'not-configured';

export class TourScheduleFetchError extends Error {
  readonly code: TourScheduleFetchErrorCode;

  constructor(code: TourScheduleFetchErrorCode, message: string) {
    super(message);
    this.name = 'TourScheduleFetchError';
    this.code = code;
  }
}

export const fetchTourSchedule = async (): Promise<TourSchedulePayload> => {
  try {
    return await loadTourSchedulePayload();
  } catch (err) {
    if (err instanceof TourDataFetchError) {
      throw new TourScheduleFetchError(err.code, err.message);
    }
    throw err;
  }
};

export {
  tourScheduleEventSchema,
  tourScheduleResponseSchema,
} from './fetchTourSchedule.schemas';
