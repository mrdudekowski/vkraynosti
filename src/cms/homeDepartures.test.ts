import { describe, expect, it } from 'vitest';
import { currentDepartures, nearestDepartureDays } from './homeDepartures';

type Status = 'planned' | 'open' | 'full' | 'cancelled' | 'completed';

function departure(
  startsOn: string,
  status: Status = 'open',
  extra: { id?: string; endsOn?: string } = {},
) {
  return {
    id: extra.id ?? `${startsOn}-${status}`,
    tourId: 'winter-1',
    startsOn,
    endsOn: extra.endsOn ?? startsOn,
    status,
  };
}

describe('nearestDepartureDays', () => {
  const today = '2026-08-17';

  it('skips an empty Monday and returns the next two start dates', () => {
    expect(
      nearestDepartureDays(
        [
          departure('2026-08-21'),
          departure('2026-08-22'),
          departure('2026-08-23'),
        ],
        today,
      ),
    ).toEqual(['2026-08-21', '2026-08-22']);
  });

  it('includes today only when today has a start', () => {
    expect(
      nearestDepartureDays(
        [departure('2026-08-17'), departure('2026-08-21')],
        today,
      ),
    ).toEqual(['2026-08-17', '2026-08-21']);
    expect(nearestDepartureDays([departure('2026-08-16')], today)).toEqual([]);
  });

  it('hides completed starts and keeps cancelled days', () => {
    expect(
      nearestDepartureDays(
        [
          departure('2026-08-21', 'completed'),
          departure('2026-08-22', 'cancelled'),
          departure('2026-08-23'),
        ],
        today,
      ),
    ).toEqual(['2026-08-22', '2026-08-23']);
  });
});

describe('currentDepartures', () => {
  const twoDay = departure('2026-08-22', 'open', {
    id: 'sat-sun',
    endsOn: '2026-08-23',
  });

  it('keeps a two-day trip current from Saturday 12:00 through Sunday 22:00 Vladivostok', () => {
    expect(
      currentDepartures([twoDay], new Date('2026-08-22T02:00:00.000Z')).map((item) => item.id),
    ).toEqual(['sat-sun']);
    expect(
      currentDepartures([twoDay], new Date('2026-08-23T12:00:00.000Z')).map((item) => item.id),
    ).toEqual(['sat-sun']);
    expect(
      currentDepartures([twoDay], new Date('2026-08-23T12:01:00.000Z')),
    ).toEqual([]);
  });

  it('excludes cancelled and completed trips even inside the window', () => {
    expect(
      currentDepartures(
        [
          departure('2026-08-22', 'cancelled', { endsOn: '2026-08-23' }),
          departure('2026-08-22', 'completed', { endsOn: '2026-08-23' }),
        ],
        new Date('2026-08-22T02:00:00.000Z'),
      ),
    ).toEqual([]);
  });
});
