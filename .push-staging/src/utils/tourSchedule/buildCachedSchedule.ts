import type {
  EnrichedScheduleEvent,
  TourPublicationStatus,
  TourScheduleDurationType,
  TourSchedulePayload,
} from '../../types/tourSchedule';
import { enrichScheduleEvents } from './enrichScheduleEvents';
import { filterEventsByPublicationStatuses } from './filterEventsByPublicationStatuses';
import { groupEventsByIsoDate } from './groupEventsByIsoDate';
import { mergeTourPrices } from './mergeTourPrices';

export interface CachedTourSchedule {
  events: EnrichedScheduleEvent[];
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  prices: ReadonlyMap<string, number>;
  durationTypes: ReadonlyMap<string, TourScheduleDurationType>;
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>;
}

const toDurationTypesMap = (
  catalogDurationTypes: Record<string, TourScheduleDurationType>,
): ReadonlyMap<string, TourScheduleDurationType> =>
  new Map(Object.entries(catalogDurationTypes));

const toPublicationStatusesMap = (
  catalogPublicationStatuses: Record<string, TourPublicationStatus>,
): ReadonlyMap<string, TourPublicationStatus> =>
  new Map(Object.entries(catalogPublicationStatuses));

export const buildCachedSchedule = (payload: TourSchedulePayload): CachedTourSchedule => {
  const publicationStatuses = toPublicationStatusesMap(payload.catalogPublicationStatuses);
  const visibleRawEvents = filterEventsByPublicationStatuses(payload.events, publicationStatuses);
  const events = enrichScheduleEvents(visibleRawEvents, publicationStatuses);
  return {
    events,
    eventsByDate: groupEventsByIsoDate(events),
    prices: mergeTourPrices(payload.events, payload.catalogPrices),
    durationTypes: toDurationTypesMap(payload.catalogDurationTypes),
    publicationStatuses,
  };
};

export const isEmptyPublicationCatalog = (result: CachedTourSchedule): boolean =>
  result.publicationStatuses.size === 0;
