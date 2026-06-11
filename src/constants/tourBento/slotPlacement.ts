import type { BentoBlockType } from './blockTypes';
import {
  GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE,
  GALLERY_GRID_BENTO_LEFT_TOP_SQUARE,
  GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE,
  GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE,
  GALLERY_GRID_BENTO_TALL_LEFT,
  GALLERY_GRID_BENTO_TALL_RIGHT,
  GALLERY_GRID_FULL_WIDTH_SQUARE,
  GALLERY_GRID_FULL_WIDTH_TILE_2X1,
  GALLERY_GRID_FULL_WIDTH_TILE_2X2,
  GALLERY_GRID_SQUARE_TILE,
} from '../tourDetailGalleryGridClasses';

export interface BentoSlotPlacement {
  /** `col-start`, `row-span`, `col-span` и общие размеры ячейки. */
  gridClass: string;
  /** Токен aspect-ratio темы. */
  aspectClass: string;
}

/** Контейнер одного bento-блока 2×2. */
export const BENTO_BLOCK_GRID_CLASS =
  'grid grid-cols-2 grid-rows-2 gap-gallery-gap w-full min-w-0' as const;

/** Один слот на всю ширину (`bento-single`): без `grid-rows-2`, иначе вторая строка пустая. */
export const BENTO_SINGLE_BLOCK_GRID_CLASS =
  'grid grid-cols-2 gap-gallery-gap w-full min-w-0' as const;

const square = (gridClass: string): BentoSlotPlacement => ({
  gridClass,
  aspectClass: 'aspect-square',
});

const tallLeft: BentoSlotPlacement = {
  gridClass: 'col-start-1 row-span-2 row-start-1 h-full min-h-0 w-full',
  aspectClass: 'aspect-gallery-bento-tall',
};

const tallRight: BentoSlotPlacement = {
  gridClass: 'col-start-2 row-span-2 row-start-1 h-full min-h-0 w-full',
  aspectClass: 'aspect-gallery-bento-tall',
};

const wideTop: BentoSlotPlacement = {
  gridClass: 'col-span-2 row-start-1 w-full min-w-0',
  aspectClass: 'aspect-gallery-tile-2x1',
};

const wideBottom: BentoSlotPlacement = {
  gridClass: 'col-span-2 row-start-2 w-full min-w-0',
  aspectClass: 'aspect-gallery-tile-2x1',
};

const fullBlock: BentoSlotPlacement = {
  gridClass: 'col-span-2 w-full min-w-0',
  aspectClass: 'aspect-gallery-tile-2x2',
};

/** Одна плитка на всю ширину 2 col, квадрат 1:1 (legacy `GALLERY_GRID_FULL_WIDTH_SQUARE`). */
const wideSquareBlock: BentoSlotPlacement = {
  gridClass: 'col-span-2 w-full min-w-0',
  aspectClass: 'aspect-square',
};

/** SSOT: тип блока → размещение слотов 1…n (порядок как на схемах в docs). */
export const BENTO_SLOT_PLACEMENTS: Record<
  BentoBlockType,
  readonly BentoSlotPlacement[]
> = {
  'bento-left': [
    tallLeft,
    square('col-start-2 row-start-1 w-full min-h-0'),
    square('col-start-2 row-start-2 w-full min-h-0'),
  ],
  'bento-right': [
    square('col-start-1 row-start-1 w-full min-h-0'),
    square('col-start-1 row-start-2 w-full min-h-0'),
    tallRight,
  ],
  'bento-center-top': [wideTop, square('col-start-1 row-start-2 w-full min-h-0'), square('col-start-2 row-start-2 w-full min-h-0')],
  'bento-center-bottom': [
    square('col-start-1 row-start-1 w-full min-h-0'),
    square('col-start-2 row-start-1 w-full min-h-0'),
    wideBottom,
  ],
  'bento-four': [
    square('col-start-1 row-start-1 w-full min-h-0'),
    square('col-start-2 row-start-1 w-full min-h-0'),
    square('col-start-1 row-start-2 w-full min-h-0'),
    square('col-start-2 row-start-2 w-full min-h-0'),
  ],
  'bento-single': [fullBlock],
  'bento-wide-square': [wideSquareBlock],
  'bento-vert': [tallLeft, tallRight],
};

/** Классы плитки для рендера (grid + aspect), без дублирования в JSX. */
export function getBentoSlotTileClassName(placement: BentoSlotPlacement): string {
  return `${placement.gridClass} ${placement.aspectClass}`.trim();
}

/**
 * Классы, совпадающие с legacy `tourDetailGalleryGridClasses` (для bento-left/right).
 * Используются в snapshot-тестах паритета с `TourDetailGallery`.
 */
export const BENTO_LEGACY_TILE_CLASS_ALIASES = {
  tallLeft: GALLERY_GRID_BENTO_TALL_LEFT,
  tallRight: GALLERY_GRID_BENTO_TALL_RIGHT,
  rightTop: GALLERY_GRID_BENTO_RIGHT_TOP_SQUARE,
  rightBottom: GALLERY_GRID_BENTO_RIGHT_BOTTOM_SQUARE,
  leftTop: GALLERY_GRID_BENTO_LEFT_TOP_SQUARE,
  leftBottom: GALLERY_GRID_BENTO_LEFT_BOTTOM_SQUARE,
  square: GALLERY_GRID_SQUARE_TILE,
  wide2x1: GALLERY_GRID_FULL_WIDTH_TILE_2X1,
  wide2x2: GALLERY_GRID_FULL_WIDTH_TILE_2X2,
  fullWidthSquare: GALLERY_GRID_FULL_WIDTH_SQUARE,
} as const;
