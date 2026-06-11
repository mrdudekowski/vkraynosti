import { useEffect, useReducer, useState } from 'react';
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

type PresenceState = {
  peakStepCount: number;
  peakFooterVisible: boolean;
};

type PresenceAction =
  | {
      type: 'sync-props';
      revealedCount: number;
      showProgramFooter: boolean;
      enabled: boolean;
    }
  | { type: 'commit-step-decrease'; revealedCount: number }
  | { type: 'commit-footer-hide' };

function presenceReducer(
  state: PresenceState,
  action: PresenceAction
): PresenceState {
  switch (action.type) {
    case 'sync-props': {
      if (!action.enabled) {
        return {
          peakStepCount: action.revealedCount,
          peakFooterVisible: action.showProgramFooter,
        };
      }

      return {
        peakStepCount: Math.max(state.peakStepCount, action.revealedCount),
        peakFooterVisible: action.showProgramFooter || state.peakFooterVisible,
      };
    }
    case 'commit-step-decrease':
      return { ...state, peakStepCount: action.revealedCount };
    case 'commit-footer-hide':
      return { ...state, peakFooterVisible: false };
    default:
      return state;
  }
}

/**
 * Держит пункты программы и footer в DOM на время fade-out перед unmount.
 */
export function useTourProgramRevealPresence({
  revealedCount,
  showProgramFooter,
  enabled,
}: UseTourProgramRevealPresenceOptions): UseTourProgramRevealPresenceResult {
  const [state, dispatch] = useReducer(presenceReducer, {
    peakStepCount: revealedCount,
    peakFooterVisible: showProgramFooter,
  });
  const [prevProps, setPrevProps] = useState({
    revealedCount,
    showProgramFooter,
    enabled,
  });

  if (
    prevProps.revealedCount !== revealedCount ||
    prevProps.showProgramFooter !== showProgramFooter ||
    prevProps.enabled !== enabled
  ) {
    setPrevProps({ revealedCount, showProgramFooter, enabled });
    dispatch({
      type: 'sync-props',
      revealedCount,
      showProgramFooter,
      enabled,
    });
  }

  useEffect(() => {
    if (!enabled || revealedCount >= state.peakStepCount) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => dispatch({ type: 'commit-step-decrease', revealedCount }),
      TOUR_PROGRAM_REVEAL_ITEM_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [enabled, revealedCount, state.peakStepCount]);

  useEffect(() => {
    if (!enabled || showProgramFooter || !state.peakFooterVisible) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => dispatch({ type: 'commit-footer-hide' }),
      TOUR_PROGRAM_REVEAL_ITEM_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [enabled, showProgramFooter, state.peakFooterVisible]);

  if (!enabled) {
    return {
      mountedStepCount: revealedCount,
      mountedFooter: showProgramFooter,
    };
  }

  return {
    mountedStepCount: Math.max(revealedCount, state.peakStepCount),
    mountedFooter: showProgramFooter || state.peakFooterVisible,
  };
}
