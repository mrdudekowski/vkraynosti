import { describe, expect, it } from 'vitest';
import {
  addIsoDays,
  defaultScheduleMode,
  formatAgendaDay,
  formatChipRange,
  scheduleVisibleDays,
  startOfIsoWeek,
  vladivostokCalendarDate,
} from './scheduleCalendar';

describe('scheduleCalendar', () => {
  it('uses Vladivostok calendar date', () => {
    expect(vladivostokCalendarDate(new Date('2026-08-17T16:30:00.000Z'))).toBe('2026-08-18');
  });

  it('builds a Monday-first week', () => {
    expect(startOfIsoWeek('2026-08-18')).toBe('2026-08-17');
    expect(scheduleVisibleDays('week', '2026-08-18')).toEqual([
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
      '2026-08-22',
      '2026-08-23',
    ]);
  });

  it('keeps a one-day trip label on the start date', () => {
    expect(formatChipRange('2026-08-15', '2026-08-15')).toBe('2026-08-15');
    expect(formatChipRange('2026-08-15', '2026-08-16')).toBe('2026-08-15 – 2026-08-16');
    expect(addIsoDays('2026-08-15', 1)).toBe('2026-08-16');
  });

  it('picks default calendar mode by viewport and formats agenda days', () => {
    expect(defaultScheduleMode('mobile')).toBe('day');
    expect(defaultScheduleMode('tablet')).toBe('week');
    expect(defaultScheduleMode('desktop')).toBe('month');
    expect(formatAgendaDay('2026-08-18')).toMatch(/18/);
  });
});
