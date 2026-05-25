import { describe, expect, it } from 'vitest';
import {
  getSafetyStatusStackHeightRem,
  getSafetyStatusStackMaxHeightClass,
  SAFETY_STATUS_STACK_LINE_COUNT_MAX,
} from './safetyStatusStackHeight';

describe('safetyStatusStackHeight', () => {
  it('computes stack height for 1 and 6 plaques', () => {
    expect(getSafetyStatusStackHeightRem(1)).toBe('4.5rem');
    expect(getSafetyStatusStackHeightRem(6)).toBe('28.875rem');
  });

  it('clamps count to valid range', () => {
    expect(getSafetyStatusStackHeightRem(0)).toBe('4.5rem');
    expect(getSafetyStatusStackHeightRem(99)).toBe('28.875rem');
  });

  it('maps count to tailwind max-height class', () => {
    expect(getSafetyStatusStackMaxHeightClass(3)).toBe('max-h-safety-status-stack-3');
    expect(getSafetyStatusStackMaxHeightClass(SAFETY_STATUS_STACK_LINE_COUNT_MAX)).toBe(
      'max-h-safety-status-stack-6'
    );
  });
});
