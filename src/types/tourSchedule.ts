import type { Season, Tour } from './index';

export type TourScheduleStatus = 'planned' | 'open' | 'full' | 'cancelled';

export type TourScheduleDurationType = 'однодневный' | 'многодневный';

export interface TourScheduleEvent {
  date: string;
  tourId: string;
  durationType: TourScheduleDurationType;
  priceRub: number | null;
  seats: number | null;
  status: TourScheduleStatus;
  comment: string | null;
}

export interface EnrichedScheduleEvent extends TourScheduleEvent {
  tour: Tour;
  season: Season;
  statusLabel: string;
}

export type TourScheduleLoadStatus = 'idle' | 'loading' | 'success' | 'error';
