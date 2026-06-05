import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchTourSchedule } from '../services/fetchTourSchedule';
import type {
  EnrichedScheduleEvent,
  TourPublicationStatus,
  TourScheduleDurationType,
  TourScheduleLoadStatus,
} from '../types/tourSchedule';
import { enrichScheduleEvents } from '../utils/tourSchedule/enrichScheduleEvents';
import { filterEventsByPublicationStatuses } from '../utils/tourSchedule/filterEventsByPublicationStatuses';
import { groupEventsByIsoDate } from '../utils/tourSchedule/groupEventsByIsoDate';
import { mergeTourPrices } from '../utils/tourSchedule/mergeTourPrices';
import { TourScheduleContext } from './tour-schedule-context-definition';

interface CachedSchedule {
  events: EnrichedScheduleEvent[];
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
  prices: ReadonlyMap<string, number>;
  durationTypes: ReadonlyMap<string, TourScheduleDurationType>;
  publicationStatuses: ReadonlyMap<string, TourPublicationStatus>;
}

const toDurationTypesMap = (
  catalogDurationTypes: Record<string, TourScheduleDurationType>
): ReadonlyMap<string, TourScheduleDurationType> =>
  new Map(Object.entries(catalogDurationTypes));

const toPublicationStatusesMap = (
  catalogPublicationStatuses: Record<string, TourPublicationStatus>
): ReadonlyMap<string, TourPublicationStatus> =>
  new Map(Object.entries(catalogPublicationStatuses));

let cachedSchedule: CachedSchedule | null = null;
let inflightPromise: Promise<CachedSchedule> | null = null;

const loadSchedule = async (): Promise<CachedSchedule> => {
  if (cachedSchedule) return cachedSchedule;
  if (inflightPromise) return inflightPromise;

  inflightPromise = fetchTourSchedule()
    .then(({ events: rawEvents, catalogPrices, catalogDurationTypes, catalogPublicationStatuses }) => {
      const publicationStatuses = toPublicationStatusesMap(catalogPublicationStatuses);
      const visibleRawEvents = filterEventsByPublicationStatuses(
        rawEvents,
        publicationStatuses,
      );
      const events = enrichScheduleEvents(visibleRawEvents, publicationStatuses);
      const result: CachedSchedule = {
        events,
        eventsByDate: groupEventsByIsoDate(events),
        prices: mergeTourPrices(rawEvents, catalogPrices),
        durationTypes: toDurationTypesMap(catalogDurationTypes),
        publicationStatuses,
      };
      cachedSchedule = result;
      return result;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};

const scheduleError = (err: unknown): Error =>
  err instanceof Error ? err : new Error('Unknown schedule error');

/** Не конкурировать с LCP: первый fetch после idle, не позже timeout (мс). */
const SCHEDULE_LOAD_IDLE_TIMEOUT_MS = 2500;

const scheduleDeferredLoad = (run: () => void): (() => void) => {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(run, { timeout: SCHEDULE_LOAD_IDLE_TIMEOUT_MS });
    return () => cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, 1);
  return () => window.clearTimeout(id);
};

export const TourScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<TourScheduleLoadStatus>(
    cachedSchedule ? 'success' : 'loading'
  );
  const [events, setEvents] = useState<EnrichedScheduleEvent[]>(cachedSchedule?.events ?? []);
  const [eventsByDate, setEventsByDate] = useState<Map<string, EnrichedScheduleEvent[]>>(
    cachedSchedule?.eventsByDate ?? new Map()
  );
  const [prices, setPrices] = useState<ReadonlyMap<string, number>>(
    cachedSchedule?.prices ?? new Map()
  );
  const [durationTypes, setDurationTypes] = useState<
    ReadonlyMap<string, TourScheduleDurationType>
  >(cachedSchedule?.durationTypes ?? new Map());
  const [publicationStatuses, setPublicationStatuses] = useState<
    ReadonlyMap<string, TourPublicationStatus>
  >(cachedSchedule?.publicationStatuses ?? new Map());
  const [error, setError] = useState<Error | null>(null);
  const retryNonce = useRef(0);

  const applySchedule = useCallback((result: CachedSchedule) => {
    setEvents(result.events);
    setEventsByDate(result.eventsByDate);
    setPrices(result.prices);
    setDurationTypes(result.durationTypes);
    setPublicationStatuses(result.publicationStatuses);
    setStatus('success');
    setError(null);
  }, []);

  useEffect(() => {
    if (cachedSchedule) return;

    let cancelled = false;

    const runLoad = () => {
      if (cancelled) return;
      void loadSchedule()
        .then(result => {
          if (!cancelled) applySchedule(result);
        })
        .catch(err => {
          if (!cancelled) {
            setStatus('error');
            setError(scheduleError(err));
          }
        });
    };

    const cancelDeferred = scheduleDeferredLoad(runLoad);

    return () => {
      cancelled = true;
      cancelDeferred();
    };
  }, [applySchedule]);

  const retry = useCallback(() => {
    retryNonce.current += 1;
    cachedSchedule = null;
    setStatus('loading');
    setError(null);

    void loadSchedule()
      .then(applySchedule)
      .catch(err => {
        setStatus('error');
        setError(scheduleError(err));
      });
  }, [applySchedule]);

  const value = useMemo(
    () => ({ status, events, eventsByDate, prices, durationTypes, publicationStatuses, error, retry }),
    [status, events, eventsByDate, prices, durationTypes, publicationStatuses, error, retry]
  );

  return <TourScheduleContext.Provider value={value}>{children}</TourScheduleContext.Provider>;
};
