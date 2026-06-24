import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { loadTourSchedulePayload } from '../services/tourData';
import { TourDataFetchError } from '../types/tourData';
import type {
  EnrichedScheduleEvent,
  TourPublicationStatus,
  TourScheduleDurationType,
  TourScheduleLoadStatus,
} from '../types/tourSchedule';
import {
  buildCachedSchedule,
  isEmptyPublicationCatalog,
  type CachedTourSchedule,
} from '../utils/tourSchedule/buildCachedSchedule';
import { readTourScheduleBootstrapPayload } from '../utils/tourSchedule/tourScheduleBootstrap';
import { TourScheduleContext } from './tour-schedule-context-definition';

/** Периодический refetch статичных JSON с S3 (без сброса snapshot до успеха). */
const SCHEDULE_CLIENT_CACHE_MAX_AGE_MS = 5 * 60 * 1000;

let cachedSchedule: CachedTourSchedule | null = null;
let cachedScheduleFetchedAt: number | null = null;
let inflightPromise: Promise<CachedTourSchedule> | null = null;

const bootstrapPayload = readTourScheduleBootstrapPayload();
if (bootstrapPayload != null && cachedSchedule == null) {
  cachedSchedule = buildCachedSchedule(bootstrapPayload);
  // ponytail: bootstrap is build-time snapshot for crawlers/first paint only — always refetch live CDN on mount
  cachedScheduleFetchedAt = null;
}

const isClientScheduleCacheStale = (): boolean => {
  if (cachedScheduleFetchedAt == null) return true;
  return Date.now() - cachedScheduleFetchedAt > SCHEDULE_CLIENT_CACHE_MAX_AGE_MS;
};

const loadSchedule = async (force = false): Promise<CachedTourSchedule> => {
  if (cachedSchedule && !force && !isClientScheduleCacheStale()) return cachedSchedule;
  if (inflightPromise) return inflightPromise;

  const previousSnapshot = cachedSchedule;

  inflightPromise = loadTourSchedulePayload()
    .then(payload => {
      const result = buildCachedSchedule(payload);
      if (isEmptyPublicationCatalog(result) && previousSnapshot) {
        console.warn('[tourSchedule] Ignoring empty catalog response; keeping previous snapshot');
        return previousSnapshot;
      }
      cachedSchedule = result;
      cachedScheduleFetchedAt = Date.now();
      return result;
    })
    .catch(err => {
      if (previousSnapshot) {
        console.warn('[tourSchedule] Fetch failed; using stale snapshot', err);
        return previousSnapshot;
      }
      throw err;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};

const scheduleError = (err: unknown): Error => {
  if (err instanceof TourDataFetchError) return err;
  return err instanceof Error ? err : new Error('Unknown schedule error');
};

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

  const applySchedule = useCallback((result: CachedTourSchedule) => {
    setEvents(result.events);
    setEventsByDate(result.eventsByDate);
    setPrices(result.prices);
    setDurationTypes(result.durationTypes);
    setPublicationStatuses(result.publicationStatuses);
    setStatus('success');
    setError(null);
  }, []);

  useEffect(() => {
    if (cachedSchedule && !isClientScheduleCacheStale()) return;

    let cancelled = false;

    const runLoad = () => {
      if (cancelled) return;
      const force = cachedSchedule != null && isClientScheduleCacheStale();
      void loadSchedule(force)
        .then(result => {
          if (!cancelled) applySchedule(result);
        })
        .catch(err => {
          if (!cancelled && cachedSchedule == null) {
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

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !isClientScheduleCacheStale()) return;
      void loadSchedule(true)
        .then(applySchedule)
        .catch(err => {
          if (cachedSchedule == null) {
            setStatus('error');
            setError(scheduleError(err));
          }
        });
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [applySchedule]);

  const retry = useCallback(() => {
    retryNonce.current += 1;
    cachedSchedule = null;
    cachedScheduleFetchedAt = null;
    setStatus('loading');
    setError(null);

    void loadSchedule(true)
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
