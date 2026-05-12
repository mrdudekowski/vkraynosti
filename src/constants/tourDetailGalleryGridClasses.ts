/**
 * Повторяющиеся композиции Tailwind для `TourDetailGallery` (токены темы, без «магических» inline-дублей).
 */

/** Высокая плитка слева в сетке 2×2 (два ряда). */
export const GALLERY_GRID_BENTO_TALL_LEFT =
  'col-start-1 row-span-2 row-start-1 aspect-gallery-bento-tall h-full min-h-0 w-full' as const;

/** Высокая плитка справа на две строки (вся правая колонка). */
export const GALLERY_GRID_BENTO_TALL_RIGHT =
  'col-start-2 row-span-2 row-start-1 aspect-gallery-bento-tall h-full min-h-0 w-full' as const;

export const GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE =
  'col-start-2 row-start-1 aspect-square w-full min-h-0' as const;

export const GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE =
  'col-start-2 row-start-2 aspect-square w-full min-h-0' as const;

export const GALLERY_GRID_BENTO_LEFT_TOP_SQUARE =
  'col-start-1 row-start-1 aspect-square w-full min-h-0' as const;

export const GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE =
  'col-start-1 row-start-2 aspect-square w-full min-h-0' as const;

export const GALLERY_GRID_SQUARE_TILE = 'aspect-square w-full min-h-0' as const;

export const GALLERY_GRID_FULL_WIDTH_SQUARE =
  'col-span-2 aspect-square w-full min-w-0' as const;

/**
 * Вся ширина `grid-cols-2`, высота как у двух квадратных рядов (`aspect-gallery-tile-2x2`).
 * Первый ряд «Читинза» / «Маралы»: широкий клип вместо пары квадратов справа от вертикали.
 */
export const GALLERY_GRID_FULL_WIDTH_TILE_2X2 =
  'col-span-2 aspect-gallery-tile-2x2 w-full min-w-0' as const;
