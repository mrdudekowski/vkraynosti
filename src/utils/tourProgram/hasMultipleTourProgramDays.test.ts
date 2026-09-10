import { describe, expect, it } from 'vitest';
import { hasMultipleTourProgramDays } from './hasMultipleTourProgramDays';

describe('hasMultipleTourProgramDays', () => {
  it('returns false for a one-day program without explicit day values', () => {
    expect(
      hasMultipleTourProgramDays([
        { timeLabel: '05:00', description: 'Выезд' },
        { timeLabel: '18:00', description: 'Возвращение' },
      ]),
    ).toBe(false);
  });

  it('returns true when the program starts a second day', () => {
    expect(
      hasMultipleTourProgramDays([
        { day: 1, timeLabel: '18:00', description: 'Ужин' },
        { day: 2, timeLabel: '07:00', description: 'Завтрак' },
      ]),
    ).toBe(true);
  });
});
