import { describe, expect, it } from 'vitest';
import { findNearestCalendarDepartureDate } from './findNearestCalendarDepartureDate';

describe('findNearestCalendarDepartureDate', () => {
  it('returns today when today has a departure', () => {
    const result = findNearestCalendarDepartureDate(
      [{ date: '2026-05-09' }, { date: '2026-05-20' }],
      new Date(2026, 4, 9, 12, 0, 0),
    );

    expect(result).toEqual(new Date(2026, 4, 9));
  });

  it('returns the next upcoming departure when today is empty', () => {
    const result = findNearestCalendarDepartureDate(
      [{ date: '2026-05-01' }, { date: '2026-05-09' }, { date: '2026-06-07' }],
      new Date(2026, 4, 2, 12, 0, 0),
    );

    expect(result).toEqual(new Date(2026, 4, 9));
  });

  it('returns the latest remaining date when every departure is in the past', () => {
    const result = findNearestCalendarDepartureDate(
      [{ date: '2026-05-01' }, { date: '2026-05-05' }],
      new Date(2026, 4, 20, 12, 0, 0),
    );

    expect(result).toEqual(new Date(2026, 4, 5));
  });

  it('returns undefined when there are no dates', () => {
    expect(findNearestCalendarDepartureDate([], new Date(2026, 4, 9))).toBeUndefined();
  });
});
