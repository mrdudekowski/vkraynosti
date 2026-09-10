import { describe, expect, it } from 'vitest';
import { adminCalendarSeason, adminCalendarSeasonFromIso, isCrossSeasonDeparture } from './adminCalendarSeason';

describe('adminCalendarSeason', () => {
  it('maps Vladivostok calendar months to seasons', () => {
    expect(adminCalendarSeason(new Date('2026-01-15T00:00:00+10:00'))).toBe('winter');
    expect(adminCalendarSeason(new Date('2026-04-01T00:00:00+10:00'))).toBe('spring');
    expect(adminCalendarSeason(new Date('2026-07-01T00:00:00+10:00'))).toBe('summer');
    expect(adminCalendarSeason(new Date('2026-10-01T00:00:00+10:00'))).toBe('fall');
    expect(adminCalendarSeason(new Date('2026-12-15T00:00:00+10:00'))).toBe('winter');
  });

  it('maps ISO dates to calendar seasons', () => {
    expect(adminCalendarSeasonFromIso('2026-08-22')).toBe('summer');
    expect(adminCalendarSeasonFromIso('2026-11-01')).toBe('fall');
    expect(isCrossSeasonDeparture('winter', '2026-08-22')).toBe(true);
    expect(isCrossSeasonDeparture('summer', '2026-08-22')).toBe(false);
  });
});
