/**
 * Сетка туров на главной (`Home.tsx`, `#tours`).
 *
 * Свёрнутый режим на `lg` (4 колонки): первая строка — 4 тура, вторая — 3 тура + карточка «Показать все».
 * Итого до 7 карточек туров + 1 служебная ячейка.
 */
export const HOME_TOURS_COLLAPSED_MAX_VISIBLE = 7 as const

/**
 * Карточки с приоритетом LCP (`fetchPriority="high"` / `loading="eager"` на обложке):
 * только первая карточка сетки (левый верх на `lg`); на mobile сетка ниже hero — остальные `lazy`.
 */
export const HOME_TOURS_PRIORITY_IMAGE_ABOVE_FOLD_COUNT = 1 as const

/** Интервал смены промо-видео на карточке раскрытия (мс). */
export const HOME_TOURS_PROMO_VIDEO_SWITCH_MS = 3000 as const
