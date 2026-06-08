export type TourPublicationStatus = 'active' | 'in_development';

export type TourDurationType = 'однодневный' | 'многодневный';

export interface PublicTour {
  id: string;
  title: string;
  priceRub: number | null;
  durationType: TourDurationType;
  publicationStatus: TourPublicationStatus;
}

export type ScheduleEventStatus =
  | 'planned'
  | 'open'
  | 'full'
  | 'cancelled'
  | 'completed';

export interface ScheduleEvent {
  date: string;
  tourId: string;
  seats: number | null;
  status: ScheduleEventStatus;
  comment: string | null;
  overridePriceRub?: number;
}

export interface ToursListPayload {
  schemaVersion: 1;
  generatedAt: string;
  tours: PublicTour[];
}

export interface SchedulePayload {
  schemaVersion: 1;
  generatedAt: string;
  events: ScheduleEvent[];
}

export type TourDataFetchErrorCode = 'network' | 'parse' | 'not-configured';

export class TourDataFetchError extends Error {
  readonly code: TourDataFetchErrorCode;

  constructor(code: TourDataFetchErrorCode, message: string) {
    super(message);
    this.name = 'TourDataFetchError';
    this.code = code;
  }
}
