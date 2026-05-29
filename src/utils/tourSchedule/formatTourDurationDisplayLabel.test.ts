import { describe, expect, it } from 'vitest';
import { UI } from '../../constants/ui';
import { formatTourDurationDisplayLabel } from './formatTourDurationDisplayLabel';

describe('formatTourDurationDisplayLabel', () => {
  it('maps однодневный to one-day label from ui.ts', () => {
    expect(formatTourDurationDisplayLabel('однодневный')).toBe(
      UI.tourDetail.durationDisplayOneDay
    );
  });

  it('maps многодневный to multi-day label from ui.ts', () => {
    expect(formatTourDurationDisplayLabel('многодневный')).toBe(
      UI.tourDetail.durationDisplayMultiDay
    );
  });
});
