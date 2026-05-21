import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchTourSchedule } from '../services/fetchTourSchedule';
import type { EnrichedScheduleEvent, TourScheduleLoadStatus } from '../types/tourSchedule';
import { enrichScheduleEvents } from '../utils/tourSchedule/enrichScheduleEvents';
import { groupEventsByIsoDate } from '../utils/tourSchedule/groupEventsByIsoDate';
import { TourScheduleContext } from './tour-schedule-context-definition';

interface CachedSchedule {
  events: EnrichedScheduleEvent[];
  eventsByDate: Map<string, EnrichedScheduleEvent[]>;
}

let cachedSchedule: CachedSchedule | null = null;
let inflightPromise: Promise<CachedSchedule> | null = null;

const loadSchedule = async (): Promise<CachedSchedule> => {
  if (cachedSchedule) return cachedSchedule;
  if (inflightPromise) return inflightPromise;

  inflightPromise = fetchTourSchedule()
    .then(raw => {
      const events = enrichScheduleEvents(raw);
      const result: CachedSchedule = {
        events,
        eventsByDate: groupEventsByIsoDate(events),
      };
      cachedSchedule = result;
      return result;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
};

export const TourScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<TourScheduleLoadStatus>(
    cachedSchedule ? 'success' : 'idle'
  );
  const [events, setEvents] = useState<EnrichedScheduleEvent[]>(cachedSchedule?.events ?? []);
  const [eventsByDate, setEventsByDate] = useState<Map<string, EnrichedScheduleEvent[]>>(
    cachedSchedule?.eventsByDate ?? new Map()
  );
  const [error, setError] = useState<Error | null>(null);
  const retryNonce = useRef(0);

  const load = useCallback(async (force = false) => {
    if (force) {
      cachedSchedule = null;
    }

    setStatus('loading');
    setError(null);

    try {
      const result = await loadSchedule();
      setEvents(result.events);
      setEventsByDate(result.eventsByDate);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err : new Error('Unknown schedule error'));
    }
  }, []);

  useEffect(() => {
    if (cachedSchedule) return;
    void load();
  }, [load]);

  const retry = useCallback(() => {
    retryNonce.current += 1;
    void load(true);
  }, [load]);

  const value = useMemo(
    () => ({ status, events, eventsByDate, error, retry }),
    [status, events, eventsByDate, error, retry]
  );

  return <TourScheduleContext.Provider value={value}>{children}</TourScheduleContext.Provider>;
};
