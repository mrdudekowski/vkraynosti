import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CASCADE_GRID_FADE_OUT_DURATION_MS,
  getCascadeGridItemAnimation,
  getCascadeGridTotalDurationMs,
  type CascadeGridItemAnimationOptions,
  type CascadeGridPhase,
} from '../constants/cascadeGridReveal';

export const useCascadeGridReveal = <T,>(
  items: T[],
  contentKey: string | null,
  cascadeLeadCount = 0,
) => {
  const [phase, setPhase] = useState<CascadeGridPhase>('idle');
  const [displayedItems, setDisplayedItems] = useState<T[]>([]);
  const [displayedKey, setDisplayedKey] = useState<string | null>(null);
  const pendingItemsRef = useRef(items);
  const pendingKeyRef = useRef<string | null>(contentKey);

  pendingItemsRef.current = items;
  pendingKeyRef.current = contentKey;

  const beginReveal = useCallback((hasVisibleItems: boolean) => {
    if (hasVisibleItems) {
      setPhase('fadingOut');
      return;
    }
    setDisplayedItems(pendingItemsRef.current);
    setDisplayedKey(pendingKeyRef.current);
    setPhase('preFadeIn');
  }, []);

  useEffect(() => {
    if (contentKey == null) {
      setDisplayedItems([]);
      setDisplayedKey(null);
      setPhase('idle');
      return;
    }

    if (phase !== 'idle') return;

    if (contentKey === displayedKey && displayedItems.length === items.length) return;

    beginReveal(displayedItems.length > 0 || displayedKey != null);
  }, [beginReveal, contentKey, displayedItems.length, displayedKey, items.length, phase]);

  useEffect(() => {
    if (phase !== 'fadingOut') return;

    const timeoutId = window.setTimeout(() => {
      setDisplayedItems(pendingItemsRef.current);
      setDisplayedKey(pendingKeyRef.current);
      setPhase('preFadeIn');
    }, CASCADE_GRID_FADE_OUT_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'preFadeIn') return;

    const frameId = window.requestAnimationFrame(() => {
      setPhase('fadingIn');
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'fadingIn') return;

    const timeoutId = window.setTimeout(() => {
      setPhase('idle');
    }, getCascadeGridTotalDurationMs(cascadeLeadCount + displayedItems.length));

    return () => window.clearTimeout(timeoutId);
  }, [cascadeLeadCount, displayedItems.length, phase]);

  const getItemAnimation = useCallback(
    (itemIndex: number, options?: CascadeGridItemAnimationOptions) =>
      getCascadeGridItemAnimation(phase, itemIndex, options),
    [phase],
  );

  return {
    phase,
    displayedItems,
    displayedKey,
    getItemAnimation,
    isAnimating: phase !== 'idle',
  };
};
