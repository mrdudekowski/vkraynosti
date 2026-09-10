import type { TourScheduleEvent } from '../../types/tourSchedule';

/** Цены из строк расписания (fallback, если в JSON нет блока `prices`). */
export const buildTourPricesFromEvents = (
  events: TourScheduleEvent[]
): Record<string, number> => {
  const prices: Record<string, number> = {};

  for (const event of events) {
    if (event.priceRub == null) continue;
    prices[event.tourId] = event.priceRub;
  }

  return prices;
};
