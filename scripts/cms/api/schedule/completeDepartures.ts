import { departureEndDate } from '../../../../src/cms/departureDates.ts';
import type { DepartureStatus } from '../db/schema.ts';

export type DepartureCompletionCandidate = {
  startsOn: string;
  durationDays: number;
  status: DepartureStatus;
};

const vladivostokDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Vladivostok',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function vladivostokCalendarDate(now: Date): string {
  const dateParts = Object.fromEntries(
    vladivostokDateFormatter
      .formatToParts(now)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

export function markCompleted(
  now: Date,
  departure: DepartureCompletionCandidate,
): DepartureStatus {
  if (
    departure.status === 'cancelled' ||
    departure.status === 'completed' ||
    !Number.isInteger(departure.durationDays) ||
    departure.durationDays < 1
  ) {
    return departure.status;
  }

  return departureEndDate(departure.startsOn, departure.durationDays) <
    vladivostokCalendarDate(now)
    ? 'completed'
    : departure.status;
}
