/**
 * Жесты карусели героя главной: пороги в пикселях (логика в `useHeroCarouselSwipe`).
 * Не тянуть в Tailwind spacing — это порог жеста, не отступ вёрстки.
 */
export const HOME_HERO_CAROUSEL_SWIPE_THRESHOLD_PX = 48 as const

/**
 * Горизонтальное смещение должно превосходить вертикальное минимум в `k` раз,
 * иначе жест считается скроллом страницы.
 */
export const HOME_HERO_CAROUSEL_SWIPE_AXIS_RATIO = 1.25 as const
