import { useEffect, useRef, useState } from 'react';
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

  const [visibleCount, setVisibleCount] = useState(1);
  const [enteringFadePhase, setEnteringFadePhase] =
    useState<SafetyStatusFadePhase>('visible');
  const [activeCheckboxPhase, setActiveCheckboxPhase] =
    useState<SafetyStatusCheckboxPhase>('pulsing');
  const prevPausedRef = useRef(paused);
  const enterVisibleGenerationRef = useRef(0);
  const activeCycleStartRef = useRef(Date.now());

  /**
   * После commit `hidden`: следующий тик — `visible`, чтобы CSS-transition
   * стартовал вместе с ростом `max-height` (не через `SAFETY_STATUS_FADE_MS` delay).
   */
  const scheduleEnterVisible = () => {
    const generation = enterVisibleGenerationRef.current + 1;
    enterVisibleGenerationRef.current = generation;
    queueMicrotask(() => {
      queueMicrotask(() => {
        if (enterVisibleGenerationRef.current !== generation) {
          return;
        }
        setEnteringFadePhase('visible');
      });
    });
  };

  useEffect(() => {
    if (!enabled) {
      setVisibleCount(safeLineCount);
      setEnteringFadePhase('visible');
      setActiveCheckboxPhase('checked');
      return;
    }

    setVisibleCount(previous => Math.min(Math.max(1, previous), safeLineCount));
  }, [enabled, safeLineCount]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    activeCycleStartRef.current = Date.now();
    setActiveCheckboxPhase('pulsing');
  }, [visibleCount, safeLineCount, enabled]);

  useEffect(() => {
    const wasPaused = prevPausedRef.current;
    prevPausedRef.current = paused;

    if (!enabled) {
      return;
    }

    if (wasPaused && !paused && visibleCount === safeLineCount) {
      setVisibleCount(1);
      setEnteringFadePhase('visible');
      setActiveCheckboxPhase('pulsing');
    }
  }, [paused, visibleCount, safeLineCount, enabled]);

  useEffect(() => {
    if (!enabled || paused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setVisibleCount(previous => {
        if (previous >= safeLineCount) {
          return previous;
        }
        setEnteringFadePhase('hidden');
        scheduleEnterVisible();
        return previous + 1;
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

    const updatePhase = () => {
      const elapsed = Date.now() - activeCycleStartRef.current;
      const isFinalPlaque = visibleCount >= safeLineCount;

      if (isFinalPlaque && elapsed >= SAFETY_STATUS_ROTATION_MS) {
        setActiveCheckboxPhase('checked');
        return;
      }

      if (elapsed >= SAFETY_STATUS_ROTATION_MS - SAFETY_STATUS_CHECK_LEAD_MS) {
        setActiveCheckboxPhase('committing');
      } else {
        setActiveCheckboxPhase('pulsing');
      }
    };

    updatePhase();
    const tickId = window.setInterval(updatePhase, SAFETY_STATUS_CHECKBOX_TICK_MS);
    return () => window.clearInterval(tickId);
  }, [enabled, paused, visibleCount, safeLineCount]);

  const isComplete = visibleCount >= safeLineCount;

  return { visibleCount, enteringFadePhase, isComplete, activeCheckboxPhase };
}
