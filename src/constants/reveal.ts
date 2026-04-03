/**
 * Scroll-reveal: IntersectionObserver и CSS из темы (`duration-reveal`, `spacing.reveal-y`).
 */

/** Совпадает с брейкпоинтом `lg` Tailwind по умолчанию (1024px). */
export const BREAKPOINT_LG_PX = 1024 as const;

/** Чуть раньше нижней границы вьюпорта — меньше «опозданий». */
export const REVEAL_ROOT_MARGIN = '0px 0px -8% 0px' as const;

export const REVEAL_THRESHOLD = 0.15;

/**
 * Запас для подгрузки src плиток ниже по странице (до появления в вьюпорте).
 * Проценты — от высоты viewport (CSS rootMargin).
 */
export const TOUR_GALLERY_TILE_IMAGE_ROOT_MARGIN = '20% 0px 24% 0px' as const;
