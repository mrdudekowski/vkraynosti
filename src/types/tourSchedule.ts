import type { Season, Tour } from './index';

export type TourScheduleStatus = 'planned' | 'open' | 'full' | 'cancelled' | 'completed';

export type TourScheduleDurationType = 'однодневный' | 'многодневный';

/** ISO-дата выезда тура (YYYY-MM-DD). */
export type TourDepartureDateIso = string;

/** Режим календаря выездов на странице тура / в модалке заявки. */
export type TourDepartureCalendarMode = 'display' | 'select';

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

export interface TourSchedulePayload {
  events: TourScheduleEvent[];
  /** Каталог цен из листов Туры_* (tourId → ₽). */
  catalogPrices: Record<string, number>;
  /** Каталог типов из листов Туры_* кол. D (tourId → однодневный | многодневный). */
  catalogDurationTypes: Record<string, TourScheduleDurationType>;
}
