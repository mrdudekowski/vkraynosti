import { VLADIVOSTOK_TIME_ZONE } from '../admin/scheduleCalendar';

export type HomeDepartureStatus = 'planned' | 'open' | 'full' | 'cancelled' | 'completed';

export const HOME_DEPARTURE_LOOKBACK_DAYS = 14;
export const HOME_DEPARTURE_LOOKAHEAD_DAYS = 90;

export type HomeDeparture = {
  id: string;
  tourId: string;
  startsOn: string;
  endsOn?: string;
  status: HomeDepartureStatus;
};

const TRIP_START_MINUTES = 5 * 60;
const TRIP_END_MINUTES = 22 * 60;

function vladivostokDateTime(now: Date): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: VLADIVOSTOK_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function nearestDepartureDays(
  departures: HomeDeparture[],
  todayIso: string,
): string[] {
  const startDays = [
    ...new Set(
      departures
        .filter((departure) => departure.status !== 'completed' && departure.startsOn >= todayIso)
        .map((departure) => departure.startsOn),
    ),
  ].sort();
  return startDays.slice(0, 2);
}

export function currentDepartures<T extends HomeDeparture>(departures: T[], now: Date): T[] {
  const { date, minutes } = vladivostokDateTime(now);
  return departures.filter((departure) => {
    if (departure.status === 'cancelled' || departure.status === 'completed') {
      return false;
    }
    const endsOn = departure.endsOn ?? departure.startsOn;
    const started =
      date > departure.startsOn || (date === departure.startsOn && minutes >= TRIP_START_MINUTES);
    const notFinished = date < endsOn || (date === endsOn && minutes <= TRIP_END_MINUTES);
    return started && notFinished;
  });
}
