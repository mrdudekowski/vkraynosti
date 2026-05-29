import type { TourScheduleDurationType, TourScheduleEvent } from '../../types/tourSchedule';

/** Типы из строк расписания (fallback, если в JSON нет блока `durationTypes`). */
export const buildCatalogDurationTypesFromEvents = (
  events: TourScheduleEvent[]
): Record<string, TourScheduleDurationType> => {
  const durationTypes: Record<string, TourScheduleDurationType> = {};

  for (const event of events) {
    durationTypes[event.tourId] = event.durationType;
  }

  return durationTypes;
};
