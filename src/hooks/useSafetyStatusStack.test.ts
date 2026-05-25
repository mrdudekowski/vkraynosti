import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SAFETY_STATUS_CHECK_LEAD_MS,
  SAFETY_STATUS_ROTATION_MS,
} from '../constants/safetyStatusRotation';
import { useSafetyStatusStack } from './useSafetyStatusStack';

describe('useSafetyStatusStack', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows all lines when animation disabled', () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: false, paused: false })
    );

    expect(result.current.visibleCount).toBe(6);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.enteringFadePhase).toBe('visible');
    expect(result.current.activeCheckboxPhase).toBe('checked');
  });

  it('starts at one plaque and grows on interval', () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: true, paused: false })
    );

    expect(result.current.visibleCount).toBe(1);

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS);
    });

    expect(result.current.visibleCount).toBe(2);
  });

  it('enters committing phase before the next plaque appears', () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: true, paused: false })
    );

    expect(result.current.activeCheckboxPhase).toBe('pulsing');

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS - SAFETY_STATUS_CHECK_LEAD_MS - 50);
    });

    expect(result.current.activeCheckboxPhase).toBe('pulsing');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.activeCheckboxPhase).toBe('committing');
  });

  it('reveals the sixth plaque after fade when stack completes', async () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: true, paused: false })
    );

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 5);
    });

    expect(result.current.visibleCount).toBe(6);
    expect(result.current.enteringFadePhase).toBe('hidden');

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.enteringFadePhase).toBe('visible');
  });

  it('plays checkbox cycle on the final plaque before staying checked', () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: true, paused: false })
    );

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 5);
    });

    expect(result.current.visibleCount).toBe(6);
    expect(result.current.activeCheckboxPhase).toBe('pulsing');

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS - SAFETY_STATUS_CHECK_LEAD_MS - 50);
    });

    expect(result.current.activeCheckboxPhase).toBe('pulsing');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.activeCheckboxPhase).toBe('committing');

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_CHECK_LEAD_MS);
    });

    expect(result.current.activeCheckboxPhase).toBe('checked');
  });

  it('stops at lineCount without advancing further', () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: true, paused: false })
    );

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 10);
    });

    expect(result.current.visibleCount).toBe(6);
    expect(result.current.isComplete).toBe(true);

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 3);
    });

    expect(result.current.visibleCount).toBe(6);
  });

  it('does not grow when paused', () => {
    const { result } = renderHook(() =>
      useSafetyStatusStack({ lineCount: 6, enabled: true, paused: true })
    );

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 5);
    });

    expect(result.current.visibleCount).toBe(1);
  });

  it('resets to one plaque after full stack when unpaused', () => {
    const { result, rerender } = renderHook(
      ({ paused }: { paused: boolean }) =>
        useSafetyStatusStack({ lineCount: 6, enabled: true, paused }),
      { initialProps: { paused: false } }
    );

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 6);
    });

    expect(result.current.visibleCount).toBe(6);

    rerender({ paused: true });

    act(() => {
      vi.advanceTimersByTime(SAFETY_STATUS_ROTATION_MS * 2);
    });

    expect(result.current.visibleCount).toBe(6);

    rerender({ paused: false });

    expect(result.current.visibleCount).toBe(1);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.activeCheckboxPhase).toBe('pulsing');
  });
});
