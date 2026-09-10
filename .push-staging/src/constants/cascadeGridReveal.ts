/** Синхронно с `duration-reveal` в `tailwind.config.ts` (500ms). */
export const CASCADE_GRID_REVEAL_DURATION_MS = 500 as const;

export const CASCADE_GRID_FADE_OUT_DURATION_MS = 260 as const;

export const CASCADE_GRID_CASCADE_STEP_MS = 70 as const;

/** Как в `Home.tsx`: задержка не растёт после 9-й карточки. */
export const CASCADE_GRID_MAX_CASCADE_INDEX = 8 as const;

export type CascadeGridPhase = 'idle' | 'fadingOut' | 'preFadeIn' | 'fadingIn';

export const CASCADE_GRID_REVEAL_TRANSITION_CLASS =
  'transition-[opacity,transform,filter] duration-reveal ease-reveal-out motion-reduce:transition-none motion-reduce:translate-y-0' as const;

export const CASCADE_GRID_ITEM_TRANSITION_CLASS =
  `h-full ${CASCADE_GRID_REVEAL_TRANSITION_CLASS}` as const;

export const getCascadeGridTotalDurationMs = (itemCount: number): number =>
  CASCADE_GRID_REVEAL_DURATION_MS +
  Math.max(itemCount - 1, 0) * CASCADE_GRID_CASCADE_STEP_MS;

export interface CascadeGridItemAnimationOptions {
  /** `false` для inline-блоков (плашка даты), `true` по умолчанию для ячеек сетки. */
  stretch?: boolean;
}

export const getCascadeGridItemAnimation = (
  phase: CascadeGridPhase,
  itemIndex: number,
  options: CascadeGridItemAnimationOptions = {},
): { className: string; style?: { transitionDelay: string } } => {
  const stretch = options.stretch !== false;
  const baseClassName = stretch
    ? CASCADE_GRID_ITEM_TRANSITION_CLASS
    : CASCADE_GRID_REVEAL_TRANSITION_CLASS;
  const maxCascadeIndex = Math.min(itemIndex, CASCADE_GRID_MAX_CASCADE_INDEX);
  const cascadeDelayStyle =
    phase === 'fadingIn' || phase === 'preFadeIn'
      ? { transitionDelay: `${maxCascadeIndex * CASCADE_GRID_CASCADE_STEP_MS}ms` }
      : undefined;

  if (phase === 'fadingOut') {
    return { className: `${baseClassName} opacity-0 -translate-y-reveal-y` };
  }
  if (phase === 'preFadeIn') {
    return { className: `${baseClassName} opacity-0 translate-y-reveal-y`, style: cascadeDelayStyle };
  }
  if (phase === 'fadingIn') {
    return { className: `${baseClassName} opacity-100 translate-y-0`, style: cascadeDelayStyle };
  }
  return { className: `${baseClassName} opacity-100 translate-y-0` };
};
