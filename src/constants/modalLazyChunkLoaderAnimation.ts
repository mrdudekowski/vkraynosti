/**
 * Синхронно с `keyframes.modal-chunk-loader-bubble`, `animation.modal-chunk-loader-bubble`
 * и `transitionDelay.modal-chunk-stagger` в `tailwind.config.ts`.
 */
export const MODAL_CHUNK_LOADER_DURATION_MS = 2000 as const

/** Задержка второго круга — половина цикла (как `animation-delay: 1s` в референсе). */
export const MODAL_CHUNK_LOADER_STAGGER_MS = 1000 as const
