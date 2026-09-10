import { describe, expect, it } from 'vitest';
import { getTourProgramDayLabel } from './getTourProgramDayLabel';

describe('getTourProgramDayLabel', () => {
  it('labels a numbered program day', () => {
    expect(
      getTourProgramDayLabel({ day: 2, timeLabel: '07:00', description: 'Завтрак' })
    ).toBe('День 2');
  });

  it('defaults legacy steps without day to Day 1', () => {
    expect(getTourProgramDayLabel({ timeLabel: '07:00', description: 'Завтрак' })).toBe(
      'День 1'
    );
  });
});
