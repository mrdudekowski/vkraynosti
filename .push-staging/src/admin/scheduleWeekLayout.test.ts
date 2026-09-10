import { describe, expect, it } from 'vitest';
import { defaultSelectedDayInWeek, isScheduleWeekLayout } from './scheduleWeekLayout';

describe('scheduleWeekLayout', () => {
  it('принимает только list и split', () => {
    expect(isScheduleWeekLayout('list')).toBe(true);
    expect(isScheduleWeekLayout('split')).toBe(true);
    expect(isScheduleWeekLayout('week')).toBe(false);
  });

  it('выбирает сегодня, если он в неделе', () => {
    expect(
      defaultSelectedDayInWeek(
        ['2026-08-17', '2026-08-18', '2026-08-19'],
        '2026-08-18',
        new Set(['2026-08-19']),
      ),
    ).toBe('2026-08-18');
  });

  it('иначе берёт первый день с выездами, затем первый день недели', () => {
    expect(
      defaultSelectedDayInWeek(
        ['2026-08-17', '2026-08-18', '2026-08-19'],
        '2026-08-10',
        new Set(['2026-08-19']),
      ),
    ).toBe('2026-08-19');
    expect(
      defaultSelectedDayInWeek(['2026-08-17', '2026-08-18'], '2026-08-10', new Set()),
    ).toBe('2026-08-17');
  });
});
