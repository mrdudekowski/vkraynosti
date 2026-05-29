/** Пауза после клика по дате перед crossfade к форме (мс). */
export const TOUR_REQUEST_SELECTED_HOLD_MS = 100 as const;

/** Crossfade между шагами «дата» и «форма»; синхронно с `transitionDuration.tour-request-step-crossfade`. */
export const TOUR_REQUEST_STEP_CROSSFADE_MS = 260 as const;

export const TOUR_REQUEST_MODAL_STEPS_CLASS = 'tour-request-modal__steps' as const;

export const TOUR_REQUEST_MODAL_STEP_CLASS = 'tour-request-modal__step' as const;

export const TOUR_REQUEST_MODAL_STEP_ACTIVE_CLASS = 'tour-request-modal__step--active' as const;

export const TOUR_REQUEST_MODAL_STEP_INACTIVE_CLASS = 'tour-request-modal__step--inactive' as const;

export const TOUR_REQUEST_MODAL_PANEL_ENTER_CLASS =
  'animate-scale-in motion-reduce:animate-none motion-reduce:opacity-100' as const;
