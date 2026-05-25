import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import {
  SAFETY_STATUS_CHECK_LEAD_MS,
  SAFETY_STATUS_CHECKBOX_TICK_MS,
  SAFETY_STATUS_ROTATION_MS,
  type SafetyStatusCheckboxPhase,
  type SafetyStatusFadePhase,
} from '../constants/safetyStatusRotation';

type UseSafetyStatusStackOptions = {
  lineCount: number;
  enabled: boolean;
  paused: boolean;
};

type StackState = {
  visibleCount: number;
  enteringFadePhase: SafetyStatusFadePhase;
  checkboxPhase: SafetyStatusCheckboxPhase;
  cycleStartMs: number;
};

type StackAction =
  | { type: 'add_plaque'; maxCount: number; now: number }
  | { type: 'fade_visible' }
  | { type: 'tick_checkbox'; maxCount: number; now: number }
  | { type: 'reset_from_pause'; now: number }
  | { type: 'clamp_visible'; max: number }
  | { type: 'set_cycle_start'; now: number };

const initialStackState = (): StackState => ({
  visibleCount: 1,
  enteringFadePhase: 'visible',
  checkboxPhase: 'pulsing',
  cycleStartMs: 0,
});

function stackReducer(state: StackState, action: StackAction): StackState {
  switch (action.type) {
    case 'add_plaque':
      if (state.visibleCount >= action.maxCount) {
        return state;
      }
      return {
        visibleCount: state.visibleCount + 1,
        enteringFadePhase: 'hidden',
        checkboxPhase: 'pulsing',
        cycleStartMs: action.now,
      };
    case 'fade_visible':
      return { ...state, enteringFadePhase: 'visible' };
    case 'tick_checkbox': {
      const phase = resolveCheckboxPhase(
        state.visibleCount,
        action.maxCount,
        state.cycleStartMs,
        action.now
      );
      if (phase === state.checkboxPhase) {
        return state;
      }
      return { ...state, checkboxPhase: phase };
    }
    case 'reset_from_pause':
      return {
        visibleCount: 1,
        enteringFadePhase: 'visible',
        checkboxPhase: 'pulsing',
        cycleStartMs: action.now,
      };
    case 'clamp_visible':
      return {
        ...state,
        visibleCount: Math.min(state.visibleCount, action.max),
      };
    case 'set_cycle_start':
      return { ...state, cycleStartMs: action.now };
    default:
      return state;
  }
}

function resolveCheckboxPhase(
  visibleCount: number,
  maxCount: number,
  cycleStartMs: number,
  now: number
): SafetyStatusCheckboxPhase {
  if (cycleStartMs <= 0) {
    return 'pulsing';
  }

  const isFinalPlaque = visibleCount >= maxCount;
  const elapsed = now - cycleStartMs;

  if (isFinalPlaque && elapsed >= SAFETY_STATUS_ROTATION_MS) {
    return 'checked';
  }

  if (elapsed >= SAFETY_STATUS_ROTATION_MS - SAFETY_STATUS_CHECK_LEAD_MS) {
    return 'committing';
  }

  return 'pulsing';
}

/**
 * Накопительный стек плашек 1…lineCount; fade-in только у последней добавленной.
 * На lineCount ротация останавливается; после outOfView → inView при полном стеке — сброс до 1.
 */
export function useSafetyStatusStack({
  lineCount,
  enabled,
  paused,
}: UseSafetyStatusStackOptions): {
  visibleCount: number;
  enteringFadePhase: SafetyStatusFadePhase;
  isComplete: boolean;
  activeCheckboxPhase: SafetyStatusCheckboxPhase;
} {
  const safeLineCount = Math.max(1, lineCount);
  const [state, dispatch] = useReducer(stackReducer, undefined, initialStackState);
  const prevPausedRef = useRef(paused);
  const enterVisibleGenerationRef = useRef(0);

  /** После commit `hidden`: два rAF — `visible`, чтобы CSS-transition успел стартовать. */
  useLayoutEffect(() => {
    if (!enabled || state.enteringFadePhase !== 'hidden') {
      return;
    }

    const generation = enterVisibleGenerationRef.current + 1;
    enterVisibleGenerationRef.current = generation;

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (enterVisibleGenerationRef.current !== generation) {
          return;
        }
        dispatch({ type: 'fade_visible' });
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) {
        cancelAnimationFrame(raf2);
      }
    };
  }, [enabled, state.enteringFadePhase]);

  useLayoutEffect(() => {
    if (!enabled) {
      prevPausedRef.current = paused;
      return;
    }

    const wasPaused = prevPausedRef.current;
    prevPausedRef.current = paused;

    if (wasPaused && !paused && state.visibleCount >= safeLineCount) {
      dispatch({ type: 'reset_from_pause', now: Date.now() });
    }
    if (state.visibleCount > safeLineCount) {
      dispatch({ type: 'clamp_visible', max: safeLineCount });
    }
  }, [enabled, paused, state.visibleCount, safeLineCount]);

  useEffect(() => {
    if (!enabled || paused || state.cycleStartMs !== 0) {
      return;
    }
    dispatch({ type: 'set_cycle_start', now: Date.now() });
  }, [enabled, paused, state.cycleStartMs]);

  useEffect(() => {
    if (!enabled || paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({
        type: 'add_plaque',
        maxCount: safeLineCount,
        now: Date.now(),
      });
    }, SAFETY_STATUS_ROTATION_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, paused, safeLineCount]);

  useEffect(() => {
    if (!enabled || paused) {
      return;
    }

    const tickId = window.setInterval(() => {
      dispatch({
        type: 'tick_checkbox',
        maxCount: safeLineCount,
        now: Date.now(),
      });
    }, SAFETY_STATUS_CHECKBOX_TICK_MS);

    return () => {
      window.clearInterval(tickId);
    };
  }, [enabled, paused, safeLineCount]);

  if (!enabled) {
    return {
      visibleCount: safeLineCount,
      enteringFadePhase: 'visible',
      isComplete: true,
      activeCheckboxPhase: 'checked',
    };
  }

  const isComplete = state.visibleCount >= safeLineCount;

  return {
    visibleCount: state.visibleCount,
    enteringFadePhase: state.enteringFadePhase,
    isComplete,
    activeCheckboxPhase: state.checkboxPhase,
  };
}
