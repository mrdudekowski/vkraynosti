/** Фаза opacity для fade-in новой плашки в стеке #safety. */
export type SafetyStatusFadePhase = 'visible' | 'hidden';

/** Интервал появления следующей плашки в стеке #safety, мс (было 4000). */
export const SAFETY_STATUS_ROTATION_MS = 3000 as const;

/** Длительность fade out / fade in при смене статуса, мс. */
export const SAFETY_STATUS_FADE_MS = 360 as const;

/** За сколько мс до следующей плашки начинается анимация «нажатия» чекбокса. */
export const SAFETY_STATUS_CHECK_LEAD_MS = 700 as const;

/** Интервал опроса фазы чекбокса активной плашки, мс. */
export const SAFETY_STATUS_CHECKBOX_TICK_MS = 50 as const;

/** Рост чекбокса `pulsing` → `committing`; синхронно с `transitionDuration.safety-checkbox-grow`. */
export const SAFETY_STATUS_CHECKBOX_GROW_MS = 400 as const;

/** Рост высоты стека на mobile; синхронно с въездом плашки (`SAFETY_STATUS_FADE_MS`). */
export const SAFETY_STATUS_STACK_EXPAND_MS = SAFETY_STATUS_FADE_MS;

export type SafetyStatusCheckboxPhase = 'pulsing' | 'committing' | 'checked';

/** Классы fade статуса (legacy opacity-only; иконка без slide). */
export const SAFETY_STATUS_FADE_CLASS =
  'transition-opacity duration-reveal ease-reveal-out motion-reduce:transition-none' as const;

/** Slide + fade въезда новой плашки справа налево (синхронно с `SAFETY_STATUS_FADE_MS`). */
export const SAFETY_STATUS_PLAQUE_ENTER_TRANSITION_CLASS =
  'transition-[opacity,transform] duration-safety-plaque-enter ease-reveal-out motion-reduce:transition-none' as const;

export const SAFETY_STATUS_PLAQUE_ENTER_VISIBLE_CLASS =
  'opacity-100 translate-x-0 motion-reduce:translate-x-0' as const;

export const SAFETY_STATUS_PLAQUE_ENTER_HIDDEN_CLASS =
  'opacity-0 translate-x-safety-plaque-enter-x motion-reduce:translate-x-0' as const;

