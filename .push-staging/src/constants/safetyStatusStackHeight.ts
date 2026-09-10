/** Синхронно с `height.safety-status-plaque` в `tailwind.config.ts`. */
export const SAFETY_STATUS_PLAQUE_HEIGHT_REM = 4.5 as const;

/** Синхронно с `gap.safety-status-stack` в `tailwind.config.ts`. */
export const SAFETY_STATUS_STACK_GAP_REM = 0.375 as const;

export const SAFETY_STATUS_STACK_LINE_COUNT_MAX = 6 as const;

/**
 * Высота стека из n плашек: n×plaque + (n−1)×gap.
 * При n=6 совпадает с `SAFETY_STATUS_STACK_HEIGHT` в tailwind.
 */
function stackHeightRem(plaqueCount: number, plaqueHeightRem: number): string {
  const count = Math.min(
    SAFETY_STATUS_STACK_LINE_COUNT_MAX,
    Math.max(1, Math.floor(plaqueCount))
  );
  const plaqueTotal = count * plaqueHeightRem;
  const gapTotal = (count - 1) * SAFETY_STATUS_STACK_GAP_REM;
  const heightRem = Math.round((plaqueTotal + gapTotal) * 10000) / 10000;
  return `${heightRem}rem`;
}

export function getSafetyStatusStackHeightRem(plaqueCount: number): string {
  return stackHeightRem(plaqueCount, SAFETY_STATUS_PLAQUE_HEIGHT_REM);
}

/** Tailwind `max-h-safety-status-stack-{n}` для анимации роста на mobile. */
export function getSafetyStatusStackMaxHeightClass(plaqueCount: number): string {
  const count = Math.min(
    SAFETY_STATUS_STACK_LINE_COUNT_MAX,
    Math.max(1, Math.floor(plaqueCount))
  );
  return `max-h-safety-status-stack-${count}`;
}
