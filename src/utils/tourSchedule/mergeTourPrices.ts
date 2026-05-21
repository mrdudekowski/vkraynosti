import type { TourScheduleEvent } from '../../types/tourSchedule';
import { buildTourPricesFromEvents } from './buildTourPricesFromEvents';

export const mergeTourPrices = (
  events: TourScheduleEvent[],
  catalogPrices: Record<string, number> = {}
): ReadonlyMap<string, number> => {
  const merged = {
    ...buildTourPricesFromEvents(events),
    ...catalogPrices,
  };

  return new Map(Object.entries(merged));
};
