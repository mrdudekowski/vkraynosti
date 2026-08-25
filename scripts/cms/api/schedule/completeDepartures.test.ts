import { describe, expect, it } from 'vitest';
import { departureEndDate } from '../../../../src/cms/departureDates.ts';
import { markCompleted } from './completeDepartures.ts';

describe('markCompleted', () => {
  const now = new Date('2026-08-17T15:30:00.000Z');

  it('completes a departure whose end date is before the Vladivostok calendar date', () => {
    expect(
      markCompleted(now, {
        startsOn: '2026-08-16',
        durationDays: 2,
        status: 'open',
      }),
    ).toBe('completed');
  });

  it('keeps a departure open on its Vladivostok end date', () => {
    expect(
      markCompleted(now, {
        startsOn: '2026-08-17',
        durationDays: 2,
        status: 'open',
      }),
    ).toBe('open');
  });

  it('never completes a cancelled departure', () => {
    expect(
      markCompleted(now, {
        startsOn: '2026-08-01',
        durationDays: 2,
        status: 'cancelled',
      }),
    ).toBe('cancelled');
  });

  it('uses the shared inclusive departure end-date rule', () => {
    expect(departureEndDate('2026-08-16', 2)).toBe('2026-08-17');
  });
});
