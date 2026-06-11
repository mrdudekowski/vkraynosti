import { useEffect, useState } from 'react';
import { TOUR_PROGRAM_REVEAL_ITEM_MS } from '../constants/tourProgramReveal';

export interface UseTourProgramRevealPresenceOptions {
  revealedCount: number;
  showProgramFooter: boolean;
  enabled: boolean;
}

export interface UseTourProgramRevealPresenceResult {
  mountedStepCount: number;
  mountedFooter: boolean;
}

/**
 * Держит пункты программы и footer в DOM на время fade-out перед unmount.
 */
export function useTourProgramRevealPresence({
  revealedCount,
  showProgramFooter,
  enabled,
}: UseTourProgramRevealPresenceOptions): UseTourProgramRevealPresenceResult {
  const [mountedStepCount, setMountedStepCount] = useState(revealedCount);
  const [mountedFooter, setMountedFooter] = useState(showProgramFooter);

  useEffect(() => {
    if (!enabled) {
      setMountedStepCount(revealedCount);
      return;
    }

    if (revealedCount >= mountedStepCount) {
      setMountedStepCount(revealedCount);
      return;
    }

    const timeoutId = window.setTimeout(
      () => setMountedStepCount(revealedCount),
      TOUR_PROGRAM_REVEAL_ITEM_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, [enabled, mountedStepCount, revealedCount]);

  useEffect(() => {
    if (!enabled) {
      setMountedFooter(showProgramFooter);
      return;
    }

    if (showProgramFooter) {
      setMountedFooter(true);
      return;
    }

    if (!mountedFooter) return;

    const timeoutId = window.setTimeout(
      () => setMountedFooter(false),
      TOUR_PROGRAM_REVEAL_ITEM_MS
    );
    return () => window.clearTimeout(timeoutId);
  }, [enabled, mountedFooter, showProgramFooter]);

  return { mountedStepCount, mountedFooter };
}
