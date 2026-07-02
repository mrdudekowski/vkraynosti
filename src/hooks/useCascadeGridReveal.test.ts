import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CASCADE_GRID_FADE_OUT_DURATION_MS, getCascadeGridTotalDurationMs } from '../constants/cascadeGridReveal';
import { useCascadeGridReveal } from './useCascadeGridReveal';

describe('useCascadeGridReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const flushCascade = (itemCount: number) => {
    act(() => {
      vi.advanceTimersByTime(getCascadeGridTotalDurationMs(itemCount) + 50);
    });
  };

  const flushFadeOut = () => {
    act(() => {
      vi.advanceTimersByTime(CASCADE_GRID_FADE_OUT_DURATION_MS + 50);
    });
  };

  it('reveals items without fade-out on first content key', () => {
    const { result } = renderHook(
      ({ items, key }) => useCascadeGridReveal(items, key),
      { initialProps: { items: ['a', 'b'], key: '2026-07-25' } },
    );

    expect(result.current.displayedItems).toEqual(['a', 'b']);

    flushCascade(2);

    expect(result.current.phase).toBe('idle');
    expect(result.current.displayedKey).toBe('2026-07-25');
  });

  it('fades out then reveals when content key changes', () => {
    const { result, rerender } = renderHook(
      ({ items, key }) => useCascadeGridReveal(items, key),
      { initialProps: { items: ['a'], key: '2026-07-25' } },
    );

    flushCascade(1);

    rerender({ items: ['b', 'c'], key: '2026-07-26' });

    expect(result.current.phase).toBe('fadingOut');
    expect(result.current.displayedItems).toEqual(['a']);

    flushFadeOut();
    flushCascade(2 + 1);

    expect(result.current.displayedItems).toEqual(['b', 'c']);
    expect(result.current.displayedKey).toBe('2026-07-26');
    expect(result.current.phase).toBe('idle');
  });
});
