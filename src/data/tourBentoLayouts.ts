/**
 * SSOT раскладок bento-галереи по турам (пилот и миграция).
 *
 * Соответствие legacy `TourGalleryLayoutVariant` → blocks (по мере миграции):
 * - `sestra` (spring-4 / fall-4) → `buildSpring4SestraBentoLayout` (5 блоков: single, left×2, single, left)
 * - summer-8 (Краббе) → `buildSummer8CrabbeBentoLayout` (center-top + vert×2)
 * - summer-9 (Неожиданный) → `buildSummer9NeozhidannyBentoLayout` (center-top + single + left)
 * - summer-11 (Ежовая/Спокойная) → `buildSummer11RelaxBentoLayout` (center-top + single + left)
 * - summer-10 (Робинзонада - Приморское Бали) → `buildSummer10EzhSestraBentoLayout` (9 блоков, 19 слотов)
 * - `shkota` (spring-11) → `buildSpring11ShkotaBentoLayout` (left + right + single + center-bottom + vert)
 * - `gamova` (spring-13) → `buildSpring13GamovaBentoLayout` (single + left×2 + vert + left)
 * - `tobizina` (spring-12) → `buildSpring12TobizinaBentoLayout` (left + center-top + left)
 *
 * @see docs/TOUR_BENTO_GRID_SYSTEM_AGENT_PROMPT.md
 */

import type { BentoMediaSlot, TourBentoGalleryLayout } from '../types/tourBento';
import {
  TOUR_SPRING_11_GALLERY_WOW_OBJECT_CLASS,
  TOUR_SPRING_13_GALLERY_PINES_OBJECT_CLASS,
  TOUR_SPRING_13_GALLERY_ROCKS_OBJECT_CLASS,
  TOUR_SPRING_13_GALLERY_VIEW7_OBJECT_CLASS,
} from '../constants/images';
import { TOUR_SUMMER_11_CLIP2_WIDE_OBJECT_CLASS } from '../constants/tourSummer11CoverCrop';
import { validateTourBentoGalleryLayout } from '../utils/tourBento/validateBentoBlock';

const SESTRA_GRID_IMAGE_COUNT = 11;

function slot(src: string, overrides: Partial<BentoMediaSlot> = {}): BentoMediaSlot {
  return { src, ...overrides };
}

/**
 * «Сестра» (spring-4): эквивалент ветки `sestra` в `TourDetailGallery`.
 * `gridImages` — массив после `galleryGridUrls.slice(2)` (11 кадров).
 */
export function buildSpring4SestraBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SESTRA_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSpring4SestraBentoLayout: expected ${SESTRA_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-single',
        slots: [slot(gridImages[7])],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[5]),
          slot(gridImages[3]),
          slot(gridImages[0]),
        ],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[2]),
          slot(gridImages[4]),
          slot(gridImages[10]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[6])],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[9]),
          slot(gridImages[1]),
          slot(gridImages[8]),
        ],
      },
    ],
  });

  return layout;
}

const SUMMER_8_GRID_IMAGE_COUNT = 7;

/**
 * «Полуостров Краббе» (summer-8).
 * `gridImages` — массив после `galleryGridUrls.slice(2)` (7 кадров).
 * preface (`wide2.webp`) только в [1] массива gallery, не в gridImages.
 * Широкий слот сетки — `preface.webp` (исходник wide.webp).
 */
export function buildSummer8CrabbeBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SUMMER_8_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSummer8CrabbeBentoLayout: expected ${SUMMER_8_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-center-top',
        slots: [
          slot(gridImages[0]),
          slot(gridImages[1]),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[3]), slot(gridImages[4])],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[5]), slot(gridImages[6])],
      },
    ],
  });

  return layout;
}

const SUMMER_9_GRID_IMAGE_COUNT = 7;

/**
 * «Водопад Неожиданный» (summer-9).
 * `gridImages` после `slice(2)`: w-1, w-2, w-3, d-2, d-1, d-3, d-4.
 */
export function buildSummer9NeozhidannyBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SUMMER_9_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSummer9NeozhidannyBentoLayout: expected ${SUMMER_9_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-center-top',
        slots: [
          slot(gridImages[0]),
          slot(gridImages[1]),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[3])],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[4]),
          slot(gridImages[5]),
          slot(gridImages[6]),
        ],
      },
    ],
  });

  return layout;
}

const SUMMER_10_GRID_IMAGE_COUNT = 19;

/**
 * «Робинзонада - Приморское Бали» (summer-10).
 * Sestra first (four + single), then sea blocks по мотивам summer-11 + ночёвка + финал.
 */
export function buildSummer10EzhSestraBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SUMMER_10_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSummer10EzhSestraBentoLayout: expected ${SUMMER_10_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-single',
        slots: [slot(gridImages[0])],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[1]),
          slot(gridImages[2]),
          slot(gridImages[3]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[4])],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[5]),
          slot(gridImages[6]),
          slot(gridImages[7]),
        ],
      },
      {
        type: 'bento-center-top',
        slots: [
          slot(gridImages[8], { objectPosition: TOUR_SUMMER_11_CLIP2_WIDE_OBJECT_CLASS }),
          slot(gridImages[9]),
          slot(gridImages[10]),
        ],
      },
      {
        type: 'bento-right',
        slots: [
          slot(gridImages[11]),
          slot(gridImages[12]),
          slot(gridImages[13]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[14])],
      },
      {
        type: 'bento-center-bottom',
        slots: [
          slot(gridImages[15]),
          slot(gridImages[16]),
          slot(gridImages[17]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[18])],
      },
    ],
  });

  return layout;
}

const SUMMER_11_GRID_IMAGE_COUNT = 7;

/**
 * «Релакс-тур в бухту Ежовую / Спокойную» (summer-11).
 * `gridImages` после `slice(2)`: clip1, bay-wide, yoga-kekur, clip2, coastal-rocks, clip3, beach-walk.
 * Стек: bento-left (EJG главный слева) → center-top → single.
 */
export function buildSummer11RelaxBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SUMMER_11_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSummer11RelaxBentoLayout: expected ${SUMMER_11_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[0]),
          slot(gridImages[1]),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-center-top',
        slots: [
          slot(gridImages[3], { objectPosition: TOUR_SUMMER_11_CLIP2_WIDE_OBJECT_CLASS }),
          slot(gridImages[4]),
          slot(gridImages[5]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[6])],
      },
    ],
  });

  return layout;
}

const SPRING_11_GRID_IMAGE_COUNT = 12;

/**
 * «Путешествие на остров Шкота» (spring-11).
 * `gridImages` после `slice(2)`: clip1, view2, view3, clip2, climb, view4, clip3,
 * view5, view6, wow, scallops, earchin — эквивалент ветки `shkota` в `TourDetailGallery`.
 */
export function buildSpring11ShkotaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SPRING_11_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSpring11ShkotaBentoLayout: expected ${SPRING_11_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[0]),
          slot(gridImages[1]),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-right',
        slots: [
          slot(gridImages[4]),
          slot(gridImages[5]),
          slot(gridImages[3]),
        ],
      }, // climb | view4 слева, clip2 справа — как `shkota` в TourDetailGallery
      {
        type: 'bento-single',
        slots: [slot(gridImages[6])],
      },
      {
        type: 'bento-center-bottom',
        slots: [
          slot(gridImages[7]),
          slot(gridImages[8]),
          slot(gridImages[9], {
            objectPosition: TOUR_SPRING_11_GALLERY_WOW_OBJECT_CLASS,
          }),
        ],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[10]), slot(gridImages[11])],
      },
    ],
  });

  return layout;
}

const SPRING_13_GRID_IMAGE_COUNT = 10;

/**
 * «Полуостров Гамова» (spring-13).
 * `gridImages` после `slice(2)`: clip6, clip1, clip3, view7, rocks, clip5,
 * sosna2, dve-sosna, summit-view, astafiev-bay — эквивалент `gamova` в `TourDetailGallery`.
 */
export function buildSpring13GamovaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SPRING_13_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSpring13GamovaBentoLayout: expected ${SPRING_13_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-single',
        slots: [
          slot(gridImages[3], {
            objectPosition: TOUR_SPRING_13_GALLERY_VIEW7_OBJECT_CLASS,
          }),
        ],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[8]),
          slot(gridImages[4], {
            objectPosition: TOUR_SPRING_13_GALLERY_ROCKS_OBJECT_CLASS,
          }),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-single',
        slots: [slot(gridImages[5])],
      },
      {
        type: 'bento-vert',
        slots: [
          slot(gridImages[6], {
            objectPosition: TOUR_SPRING_13_GALLERY_PINES_OBJECT_CLASS,
          }),
          slot(gridImages[7], {
            objectPosition: TOUR_SPRING_13_GALLERY_PINES_OBJECT_CLASS,
          }),
        ],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[1]),
          slot(gridImages[0]),
          slot(gridImages[9]),
        ],
      },
    ],
  });

  return layout;
}

const SPRING_12_GRID_IMAGE_COUNT = 9;

/**
 * «Мыс Тобизина» (spring-12).
 * `gridImages` после `slice(2)`: clip1, p1, clip2, p2, clip3, p3, clip4, p4, clip5.
 */
export function buildSpring12TobizinaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SPRING_12_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSpring12TobizinaBentoLayout: expected ${SPRING_12_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[0]),
          slot(gridImages[1]),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-center-top',
        slots: [
          slot(gridImages[3]),
          slot(gridImages[4]),
          slot(gridImages[5]),
        ],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[6]),
          slot(gridImages[7]),
          slot(gridImages[8]),
        ],
      },
    ],
  });

  return layout;
}

export const TOUR_BENTO_LAYOUT_BUILDER_IDS = [
  'spring-4',
  'spring-11',
  'spring-12',
  'spring-13',
  'summer-8',
  'summer-9',
  'summer-10',
  'summer-11',
] as const;

export type TourBentoLayoutBuilderId = (typeof TOUR_BENTO_LAYOUT_BUILDER_IDS)[number];

const tourBentoLayoutBuilders: Record<
  TourBentoLayoutBuilderId,
  (gridImages: string[]) => TourBentoGalleryLayout
> = {
  'spring-4': buildSpring4SestraBentoLayout,
  'spring-11': buildSpring11ShkotaBentoLayout,
  'spring-12': buildSpring12TobizinaBentoLayout,
  'spring-13': buildSpring13GamovaBentoLayout,
  'summer-8': buildSummer8CrabbeBentoLayout,
  'summer-9': buildSummer9NeozhidannyBentoLayout,
  'summer-10': buildSummer10EzhSestraBentoLayout,
  'summer-11': buildSummer11RelaxBentoLayout,
};

export function buildTourBentoLayoutForId(
  tourId: TourBentoLayoutBuilderId,
  gridImages: string[]
): TourBentoGalleryLayout {
  return tourBentoLayoutBuilders[tourId](gridImages);
}
