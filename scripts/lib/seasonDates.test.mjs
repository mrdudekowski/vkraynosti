import { describe, expect, it } from 'vitest';
import {
  buildSeasonCalendarDates,
  buildSeasonDatesByMonth,
  buildSeasonWeekendDates,
  countSeasonCalendarDays,
  formatMonthHeading,
  getSeasonDatePickerRange,
  seasonDateValidationFormula,
  seasonDateValidationFormulaSheetsRu,
  verifySeasonCalendarDaysByMonth,
} from './seasonDates.mjs';

describe('seasonDates', () => {
  it('spring has three calendar months (Mar–May)', () => {
    const groups = buildSeasonDatesByMonth('spring');
    expect(groups.map((g) => g.label)).toEqual(['Март 2026', 'Апрель 2026', 'Май 2026']);
  });

  it('winter spans Dec 2025 and Jan–Feb 2026 with every calendar day', () => {
    const groups = buildSeasonDatesByMonth('winter');
    expect(groups.map((g) => g.label)).toEqual([
      'Декабрь 2025',
      'Январь 2026',
      'Февраль 2026',
    ]);
    expect(groups.map((g) => g.days.length)).toEqual([31, 31, 28]);
    expect(countSeasonCalendarDays('winter')).toBe(90);
    expect(verifySeasonCalendarDaysByMonth('winter').every((m) => m.ok)).toBe(true);
  });

  it('each season month lists days 1 through last day of month', () => {
    for (const season of ['winter', 'spring', 'summer', 'fall']) {
      const checks = verifySeasonCalendarDaysByMonth(season);
      expect(checks.every((m) => m.ok)).toBe(true);
      for (const group of buildSeasonDatesByMonth(season)) {
        expect(group.days[0]?.getDate()).toBe(1);
        expect(group.days.at(-1)?.getDate()).toBe(group.days.length);
      }
    }
  });

  it('weekend-only list is smaller than full calendar', () => {
    for (const season of ['winter', 'spring', 'summer', 'fall']) {
      expect(buildSeasonWeekendDates(season).length).toBeLessThan(countSeasonCalendarDays(season));
    }
  });

  it('picker range is contiguous for calendar (date between)', () => {
    const winter = getSeasonDatePickerRange('winter');
    expect(winter?.minParts).toEqual({ year: 2025, month: 12, day: 1 });
    expect(winter?.maxParts).toEqual({ year: 2026, month: 2, day: 28 });

    const spring = getSeasonDatePickerRange('spring');
    expect(spring?.minParts.month).toBe(3);
    expect(spring?.maxParts.month).toBe(5);
  });

  it('validation formula allows empty cell and season bounds', () => {
    const formula = seasonDateValidationFormula('spring', 2);
    expect(formula).toContain('OR(A2=""');
    expect(formula).toContain('DATE(2026,3,1)');
    expect(formula).toContain('DATE(2026,5,31)');
  });

  it('RU Sheets formula uses semicolons', () => {
    const ru = seasonDateValidationFormulaSheetsRu('spring', 5);
    expect(ru).toContain('ИЛИ');
    expect(ru).toContain('ДАТА(2026;3;1)');
    expect(ru).not.toContain('DATE(2026,3,1)');
  });

  it('formatMonthHeading', () => {
    expect(formatMonthHeading(2026, 3)).toBe('Март 2026');
  });

  it('buildSeasonCalendarDates matches sum of month groups', () => {
    for (const season of ['winter', 'spring', 'summer', 'fall']) {
      const flat = buildSeasonCalendarDates(season);
      const fromGroups = buildSeasonDatesByMonth(season).flatMap((g) => g.days);
      expect(flat.length).toBe(fromGroups.length);
    }
  });
});
