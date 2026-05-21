import { createContext } from 'react';
import type { EnrichedScheduleEvent, TourScheduleLoadStatus } from '../types/tourSchedule';

export interface TourScheduleContextValue {
  status: TourScheduleLoadStatus;
  events: EnrichedScheduleEvent[];
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  error: Error | null;
  retry: () => void;
}

export const TourScheduleContext = createContext<TourScheduleContextValue | null>(null);
