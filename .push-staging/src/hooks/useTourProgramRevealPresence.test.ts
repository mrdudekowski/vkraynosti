import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  TOUR_PROGRAM_REVEAL_ITEM_MS,
  getTourProgramStepRevealClassName,
} from '../constants/tourProgramReveal';
import { useTourProgramRevealPresence } from './useTourProgramRevealPresence';

describe('getTourProgramStepRevealClassName', () => {
  it('returns visible classes when step is shown', () => {
    expect(getTourProgramStepRevealClassName(true)).toContain('reveal-program-step-visible');
    expect(getTourProgramStepRevealClassName(true)).not.toContain('reveal-program-step-hidden');
  });

  it('returns hidden classes when step is exiting', () => {
    expect(getTourProgramStepRevealClassName(false)).toContain('reveal-program-step-hidden');
    expect(getTourProgramStepRevealClassName(false)).not.toContain('reveal-program-step-visible');
  });
});

describe('useTourProgramRevealPresence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('mounts new steps immediately when revealedCount increases', () => {
    const { result, rerender } = renderHook(
      (props) => useTourProgramRevealPresence(props),
      {
        initialProps: {
          revealedCount: 1,
          showProgramFooter: false,
          enabled: true,
        },
      }
    );

    rerender({
      revealedCount: 3,
      showProgramFooter: false,
      enabled: true,
    });

    expect(result.current.mountedStepCount).toBe(3);
  });

  it('keeps exiting steps mounted until fade duration elapses', () => {
    const { result, rerender } = renderHook(
      (props) => useTourProgramRevealPresence(props),
      {
        initialProps: {
          revealedCount: 3,
          showProgramFooter: false,
          enabled: true,
        },
      }
    );

    rerender({
      revealedCount: 1,
      showProgramFooter: false,
      enabled: true,
    });

    expect(result.current.mountedStepCount).toBe(3);

    act(() => {
      vi.advanceTimersByTime(TOUR_PROGRAM_REVEAL_ITEM_MS);
    });

    expect(result.current.mountedStepCount).toBe(1);
  });

  it('keeps footer mounted while fading out', () => {
    const { result, rerender } = renderHook(
      (props) => useTourProgramRevealPresence(props),
      {
        initialProps: {
          revealedCount: 2,
          showProgramFooter: true,
          enabled: true,
        },
      }
    );

    rerender({
      revealedCount: 1,
      showProgramFooter: false,
      enabled: true,
    });

    expect(result.current.mountedFooter).toBe(true);

    act(() => {
      vi.advanceTimersByTime(TOUR_PROGRAM_REVEAL_ITEM_MS);
    });

    expect(result.current.mountedFooter).toBe(false);
  });
});
