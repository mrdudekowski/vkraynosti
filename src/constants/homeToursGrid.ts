/**
 * Сетка туров на главной (`Home.tsx`, `#tours`).
 *
 * Свёрнутый режим на `lg` (4 колонки): первая строка — 4 тура, вторая — 3 тура + карточка «Показать все».
 * Итого до 7 карточек туров + 1 служебная ячейка.
 */
export const HOME_TOURS_COLLAPSED_MAX_VISIBLE = 7 as const

/**
 * Карточки с приоритетом LCP (`fetchPriority="high"` / `loading="eager"` на обложке):
 * первый ряд при `lg:grid-cols-4` и те же первые карточки в развёрнутом режиме.
 */
export const HOME_TOURS_PRIORITY_IMAGE_ABOVE_FOLD_COUNT = 4 as const

/** Интервал смены промо-видео на карточке раскрытия (мс). */
export const HOME_TOURS_PROMO_VIDEO_SWITCH_MS = 3000 as const
