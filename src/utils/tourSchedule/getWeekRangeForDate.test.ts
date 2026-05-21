import { describe, expect, it } from 'vitest';
import { getWeekRangeForIsoDate } from './getWeekRangeForDate';

describe('getWeekRangeForIsoDate', () => {
  it('returns Monday–Sunday range label for a mid-week date', () => {
    const range = getWeekRangeForIsoDate('2026-05-09');
    expect(range.start.getDay()).toBe(1);
    expect(range.end.getDay()).toBe(0);
    expect(range.label).toContain('мая');
  });
});
