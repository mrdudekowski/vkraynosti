import { createContext } from 'react';
import type {
  EnrichedScheduleEvent,
  TourScheduleDurationType,
  TourScheduleLoadStatus,
} from '../types/tourSchedule';

export interface TourScheduleContextValue {
  status: TourScheduleLoadStatus;
  events: EnrichedScheduleEvent[];
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  prices: ReadonlyMap<string, number>;
  durationTypes: ReadonlyMap<string, TourScheduleDurationType>;
  error: Error | null;
  retry: () => void;
}

export const TourScheduleContext = createContext<TourScheduleContextValue | null>(null);
