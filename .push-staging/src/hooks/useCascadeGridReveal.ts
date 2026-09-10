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
  const [phase, setPhase] = useState<CascadeGridPhase>(() =>
    contentKey != null ? 'preFadeIn' : 'idle',
  );
  const [displayedItems, setDisplayedItems] = useState<T[]>(() => (contentKey != null ? items : []));
  const [displayedKey, setDisplayedKey] = useState<string | null>(() => contentKey);
  const [prevContentKey, setPrevContentKey] = useState(contentKey);
  const [prevItemsLength, setPrevItemsLength] = useState(items.length);
  const pendingItemsRef = useRef(items);
  const pendingKeyRef = useRef<string | null>(contentKey);

  useEffect(() => {
    pendingItemsRef.current = items;
    pendingKeyRef.current = contentKey;
  }, [contentKey, items]);

  if (contentKey !== prevContentKey) {
    setPrevContentKey(contentKey);
    if (contentKey == null) {
      setDisplayedItems([]);
      setDisplayedKey(null);
      setPhase('idle');
    } else if (phase === 'idle') {
      const hasVisible = displayedItems.length > 0 || displayedKey != null;
      if (contentKey !== displayedKey || displayedItems.length !== items.length) {
        if (hasVisible) {
          setPhase('fadingOut');
        } else {
          setDisplayedItems(items);
          setDisplayedKey(contentKey);
          setPhase('preFadeIn');
        }
      }
    }
  } else if (
    contentKey != null &&
    phase === 'idle' &&
    contentKey === displayedKey &&
    items.length !== prevItemsLength
  ) {
    setPrevItemsLength(items.length);
    if (displayedItems.length > 0 || displayedKey != null) {
      setPhase('fadingOut');
    }
  } else if (items.length !== prevItemsLength) {
    setPrevItemsLength(items.length);
  }

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
