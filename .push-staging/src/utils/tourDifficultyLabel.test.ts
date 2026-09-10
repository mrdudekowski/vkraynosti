import { describe, expect, it } from 'vitest';
import { UI } from '../constants/ui';
import type { Tour } from '../types';
import {
  formatDifficultyRangeLabel,
  hasCustomTourDifficultyLabel,
  resolveTourDifficultyLabel,
} from './tourDifficultyLabel';

const baseTour = {
  difficulty: 'Medium',
} as Pick<Tour, 'difficulty' | 'difficultyDisplayLabel'>;

describe('formatDifficultyRangeLabel', () => {
  it('maps enum keys to UI.difficulty.labels', () => {
    expect(formatDifficultyRangeLabel('Easy', 'Hard')).toBe('Лёгкий / Сложный');
    expect(formatDifficultyRangeLabel('Easy', 'Medium')).toBe('Лёгкий / Средний');
  });
});

describe('resolveTourDifficultyLabel', () => {
  it('uses canonical label when no override is set', () => {
    expect(resolveTourDifficultyLabel(baseTour)).toBe(UI.difficulty.labels.Medium);
  });

  it('returns custom override when set', () => {
    expect(
      resolveTourDifficultyLabel({
        ...baseTour,
        difficultyDisplayLabel: formatDifficultyRangeLabel('Easy', 'Hard'),
      }),
    ).toBe('Лёгкий / Сложный');
  });
});

describe('hasCustomTourDifficultyLabel', () => {
  it('detects explicit override', () => {
    expect(hasCustomTourDifficultyLabel({})).toBe(false);
    expect(
      hasCustomTourDifficultyLabel({
        difficultyDisplayLabel: UI.difficulty.customLabels.easyHiking,
      }),
    ).toBe(true);
  });
});
