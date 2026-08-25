import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_AUTOSAVE_DELAY_MS } from '../../constants/adminUiTokens';
import { useAdminAutosave } from './useAdminAutosave';

describe('useAdminAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces save and skips when disabled', () => {
    const save = vi.fn();
    const { rerender } = renderHook(
      (props: { enabled: boolean; snapshot: string }) => useAdminAutosave({ ...props, save }),
      { initialProps: { enabled: false, snapshot: 'a' } },
    );

    act(() => {
      vi.advanceTimersByTime(ADMIN_AUTOSAVE_DELAY_MS);
    });
    expect(save).not.toHaveBeenCalled();

    rerender({ enabled: true, snapshot: 'b' });
    act(() => {
      vi.advanceTimersByTime(ADMIN_AUTOSAVE_DELAY_MS - 1);
    });
    expect(save).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(save).toHaveBeenCalledTimes(1);
  });
});
