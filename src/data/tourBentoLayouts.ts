/**
 * SSOT раскладок bento-галереи по турам (пилот и миграция).
 *
 * Соответствие legacy `TourGalleryLayoutVariant` → blocks (по мере миграции):
 * - `sestra` (spring-4 / fall-4) → `buildSpring4SestraBentoLayout` (5 блоков: single, left×2, single, left)
 * - summer-8 (Краббе) → `buildSummer8CrabbeBentoLayout` (center-top + vert×2)
 * - summer-9 (Неожиданный) → `buildSummer9NeozhidannyBentoLayout` (center-top + single + left)
 * - summer-11 (Ежовая/Спокойная) → `buildSummer11RelaxBentoLayout` (center-top + single + left)
 * - summer-14 (Остров Петрова) → `buildSummer14PetrovaBentoLayout` (left + center-bottom)
 * - summer-10 (Робинзонада - Приморское Бали) → `buildSummer10EzhSestraBentoLayout` (9 блоков, 19 слотов)
 * - `shkota` (spring-11) → `buildSpring11ShkotaBentoLayout` (left + right + single + center-bottom + vert)
 * - `gamova` (spring-13) → `buildSpring13GamovaBentoLayout` (single + left×2 + vert + left)
 * - `tobizina` (spring-12) → `buildSpring12TobizinaBentoLayout` (left + center-top + left)
 * - `chitinza` (spring-5 / fall-5) → `buildSpring5ChitindzuBentoLayout` (single + vert + left + wide-square×3 + vert)
 * - `chitinza` (spring-6 / fall-6) → `buildSpring6MaralyDrakonyBentoLayout` (single + vert + left + wide-square×3 + vert)
 * - `izubrinaya` (winter-1) → `buildWinter1IzubrinayaBentoLayout`
 * - Голец (winter-2) → `buildWinter2GolecBentoLayout`
 * - Грибановка (winter-3) → `buildWinter3GribanovkaBentoLayout`
 * - Хаски (winter-4) → `buildWinter4HuskyBentoLayout`
 * - `arsgora` (winter-5) → `buildWinter5ArsgoraBentoLayout`
 * - `lysy-ded` (spring-1) → `buildSpring1LysyDedBentoLayout`
 * - `olkhovaya` (spring-2) → `buildSpring2OlkhovayaBentoLayout`
 * - `pidan` (spring-3) → `buildSpring3PidanBentoLayout` (без taiga и clip4)
 * - `dardanelles` (spring-7) → `buildSpring7DardanellesBentoLayout`
 * - `falaza` (spring-8) → `buildSpring8FalazaBentoLayout`
 * - `vorobey-winery` (spring-9) → `buildSpring9VorobeyBentoLayout`
 * - `askold` (spring-10) → `buildSpring10AskoldBentoLayout` (без clip2)
 * - `tachingouza` (summer-1) → `buildSummer1TachingouzaBentoLayout`
 * - `severCoast` (summer-7) → `buildSummer7SeverCoastBentoLayout`
 *
 * @see docs/TOUR_BENTO_GRID_SYSTEM_AGENT_PROMPT.md
 */

import type {
  BentoBlockType,
  BentoMediaSlot,
  TourBentoGalleryLayout,
} from '../types/tourBento';
import {
  TOUR_SPRING_10_GALLERY_TALL_PANORAMA_OBJECT_CLASS,
  TOUR_SPRING_11_GALLERY_WOW_OBJECT_CLASS,
  TOUR_SPRING_13_GALLERY_PINES_OBJECT_CLASS,
  TOUR_SPRING_13_GALLERY_ROCKS_OBJECT_CLASS,
  TOUR_SPRING_13_GALLERY_VIEW7_OBJECT_CLASS,
  TOUR_WINTER_1_GALLERY_REST4_OBJECT_CLASS,
  TOUR_WINTER_4_GALLERY_GORA_OBJECT_CLASS,
  TOUR_SUMMER_14_BOARDWALK_OBJECT_POSITION,
  TOUR_SUMMER_14_CLIFFS_OBJECT_POSITION,
  TOUR_SUMMER_14_COVE_OBJECT_POSITION,
  TOUR_SUMMER_14_SUNSET_PIER_OBJECT_POSITION,
} from '../constants/images';
import { TOUR_SUMMER_1_CLIP4_GRID_VIDEO_OBJECT_CLASS } from '../constants/tourSummer1GalleryCrop';
import { TOUR_SUMMER_11_CLIP2_WIDE_OBJECT_CLASS } from '../constants/tourSummer11CoverCrop';
import { validateTourBentoGalleryLayout } from '../utils/tourBento/validateBentoBlock';

const SESTRA_GRID_IMAGE_COUNT = 11;

function slot(src: string, overrides: Partial<BentoMediaSlot> = {}): BentoMediaSlot {
  return { src, ...overrides };
}

type IndexedBentoBlock = {
  type: BentoBlockType;
  indices: readonly number[];
  objectPositionByIndex?: Readonly<Record<number, string>>;
};

function buildIndexedBentoLayout(
  builderName: string,
  gridImages: string[],
  expectedCount: number,
  blocks: readonly IndexedBentoBlock[]
): TourBentoGalleryLayout {
  if (gridImages.length !== expectedCount) {
    throw new Error(
      `${builderName}: expected ${expectedCount} grid images, got ${gridImages.length}`
    );
  }

  return validateTourBentoGalleryLayout({
    blocks: blocks.map((block) => ({
      type: block.type,
      slots: block.indices.map((index) => {
        const src = gridImages[index];
        if (src == null) {
          throw new Error(`${builderName}: missing grid image at index ${index}`);
        }
        const objectPosition = block.objectPositionByIndex?.[index];
        return slot(src, objectPosition != null ? { objectPosition } : {});
      }),
    })),
  });
}

/** Заглушки и туры без именной раскладки: каждый кадр сетки — `bento-single`. */
export function buildFallbackSinglesBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return validateTourBentoGalleryLayout({
    blocks: gridImages.map((src) => ({
      type: 'bento-single' as const,
      slots: [slot(src)],
    })),
  });
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

const SUMMER_14_GRID_IMAGE_COUNT = 6;

/**
 * «Остров Петрова» (summer-14).
 * `gridImages` после `slice(2)`: cove, spit, trail-group, cliffs, sunset-pier, boardwalk.
 * Стек CMS: bento-left → bento-center-bottom.
 */
export function buildSummer14PetrovaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== SUMMER_14_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSummer14PetrovaBentoLayout: expected ${SUMMER_14_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[0], { objectPosition: TOUR_SUMMER_14_COVE_OBJECT_POSITION }),
          slot(gridImages[1]),
          slot(gridImages[2]),
        ],
      },
      {
        type: 'bento-center-bottom',
        slots: [
          slot(gridImages[3], { objectPosition: TOUR_SUMMER_14_CLIFFS_OBJECT_POSITION }),
          slot(gridImages[4], { objectPosition: TOUR_SUMMER_14_SUNSET_PIER_OBJECT_POSITION }),
          slot(gridImages[5], { objectPosition: TOUR_SUMMER_14_BOARDWALK_OBJECT_POSITION }),
        ],
      },
    ],
  });

  return layout;
}

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

const CHITINDZU_GRID_IMAGE_COUNT = 10;

/**
 * «Читинза» (spring-5 / fall-5): эквивалент ветки `chitinza` в `TourDetailGallery`.
 * `gridImages` — массив после `galleryGridUrls.slice(2)` (10 кадров).
 */
export function buildSpring5ChitindzuBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== CHITINDZU_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSpring5ChitindzuBentoLayout: expected ${CHITINDZU_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-single',
        slots: [slot(gridImages[0])],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[4]), slot(gridImages[5])],
      },
      {
        type: 'bento-left',
        slots: [
          slot(gridImages[2]),
          slot(gridImages[3]),
          slot(gridImages[4]),
        ],
      },
      {
        type: 'bento-wide-square',
        slots: [slot(gridImages[6])],
      },
      {
        type: 'bento-wide-square',
        slots: [slot(gridImages[1])],
      },
      {
        type: 'bento-wide-square',
        slots: [slot(gridImages[7])],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[8]), slot(gridImages[9])],
      },
    ],
  });

  return layout;
}

const MARALY_DRAKONY_GRID_IMAGE_COUNT = 11;

/**
 * «Маралы х Драконы» (spring-6 / fall-6): эквивалент ветки `chitinza` в `TourDetailGallery`.
 * `gridImages` — массив после `galleryGridUrls.slice(2)` (11 кадров).
 */
export function buildSpring6MaralyDrakonyBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  if (gridImages.length !== MARALY_DRAKONY_GRID_IMAGE_COUNT) {
    throw new Error(
      `buildSpring6MaralyDrakonyBentoLayout: expected ${MARALY_DRAKONY_GRID_IMAGE_COUNT} grid images, got ${gridImages.length}`
    );
  }

  const layout = validateTourBentoGalleryLayout({
    blocks: [
      {
        type: 'bento-single',
        slots: [slot(gridImages[6])],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[5]), slot(gridImages[7])],
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
        type: 'bento-wide-square',
        slots: [slot(gridImages[4])],
      },
      {
        type: 'bento-wide-square',
        slots: [slot(gridImages[0])],
      },
      {
        type: 'bento-wide-square',
        slots: [slot(gridImages[8])],
      },
      {
        type: 'bento-vert',
        slots: [slot(gridImages[9]), slot(gridImages[10])],
      },
    ],
  });

  return layout;
}

const WINTER_1_GRID_IMAGE_COUNT = 7;

/**
 * «Изюбриная» (winter-1). После `slice(2)`: портрет, bento-left, остаток одиночными.
 * Кадрирование `iz.rest4` — по индексу, не по CDN URL (fall/cms-dev).
 */
export function buildWinter1IzubrinayaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildWinter1IzubrinayaBentoLayout', gridImages, WINTER_1_GRID_IMAGE_COUNT, [
    { type: 'bento-single', indices: [0] },
    { type: 'bento-left', indices: [1, 2, 3] },
    { type: 'bento-single', indices: [4] },
    { type: 'bento-single', indices: [5] },
    {
      type: 'bento-single',
      indices: [6],
      objectPositionByIndex: { 6: TOUR_WINTER_1_GALLERY_REST4_OBJECT_CLASS },
    },
  ]);
}

const WINTER_2_GRID_IMAGE_COUNT = 6;

/** «Голец» (winter-2): три ряда по два квадрата. */
export function buildWinter2GolecBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildWinter2GolecBentoLayout', gridImages, WINTER_2_GRID_IMAGE_COUNT, [
    { type: 'bento-vert', indices: [0, 1] },
    { type: 'bento-vert', indices: [2, 3] },
    { type: 'bento-vert', indices: [4, 5] },
  ]);
}

const WINTER_3_GRID_IMAGE_COUNT = 11;

/**
 * «Фалаза × Грибановка» (winter-3).
 * `slice(2)`: lift, clip1, board, board2, clip2, elya, instr, clip3, bbq, clip4, clip5.
 */
export function buildWinter3GribanovkaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout(
    'buildWinter3GribanovkaBentoLayout',
    gridImages,
    WINTER_3_GRID_IMAGE_COUNT,
    [
      { type: 'bento-vert', indices: [4, 7] },
      { type: 'bento-wide-square', indices: [0] },
      { type: 'bento-vert', indices: [2, 3] },
      { type: 'bento-vert', indices: [5, 6] },
      { type: 'bento-vert', indices: [1, 8] },
      { type: 'bento-vert', indices: [9, 10] },
    ]
  );
}

const WINTER_4_GRID_IMAGE_COUNT = 6;

/**
 * «Хаски-тур» (winter-4). После `slice(2)`: clip1, doggo, doggos, clip2, gora2, gora.
 */
export function buildWinter4HuskyBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildWinter4HuskyBentoLayout', gridImages, WINTER_4_GRID_IMAGE_COUNT, [
    { type: 'bento-left', indices: [0, 1, 2] },
    { type: 'bento-single', indices: [3] },
    {
      type: 'bento-vert',
      indices: [4, 5],
      objectPositionByIndex: { 5: TOUR_WINTER_4_GALLERY_GORA_OBJECT_CLASS },
    },
  ]);
}

const WINTER_5_GRID_IMAGE_COUNT = 6;

/**
 * «АрсГора» (winter-5). После `slice(2)`: lift, doggie, clip1, clip2, trans-tail, team.
 */
export function buildWinter5ArsgoraBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildWinter5ArsgoraBentoLayout', gridImages, WINTER_5_GRID_IMAGE_COUNT, [
    { type: 'bento-single', indices: [0] },
    { type: 'bento-vert', indices: [1, 2] },
    { type: 'bento-left', indices: [3, 4, 5] },
  ]);
}

const SPRING_1_GRID_IMAGE_COUNT = 4;

/** «Лысый Дед» (spring-1): descent, ridge, summit, approach. */
export function buildSpring1LysyDedBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildSpring1LysyDedBentoLayout', gridImages, SPRING_1_GRID_IMAGE_COUNT, [
    { type: 'bento-wide-square', indices: [0] },
    { type: 'bento-vert', indices: [1, 2] },
    { type: 'bento-wide-square', indices: [3] },
  ]);
}

const SPRING_2_GRID_IMAGE_COUNT = 4;

/** «Ольховая» (spring-2): lake, ridge, summit, clip1. */
export function buildSpring2OlkhovayaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildSpring2OlkhovayaBentoLayout', gridImages, SPRING_2_GRID_IMAGE_COUNT, [
    { type: 'bento-wide-square', indices: [0] },
    { type: 'bento-left', indices: [1, 2, 3] },
  ]);
}

const SPRING_3_GRID_IMAGE_COUNT = 11;

/**
 * «Пидан» (spring-3). `slice(2)`: group, clip3, clip2, ridge, clip5, summit, clip4, sea, taiga, clip6, clip7.
 * В сетке нет taiga [8] и clip4 [6] — как в `TourDetailGallery`.
 */
export function buildSpring3PidanBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildSpring3PidanBentoLayout', gridImages, SPRING_3_GRID_IMAGE_COUNT, [
    { type: 'bento-wide-square', indices: [1] },
    { type: 'bento-vert', indices: [4, 5] },
    { type: 'bento-wide-square', indices: [7] },
    { type: 'bento-vert', indices: [9, 10] },
    { type: 'bento-left', indices: [2, 3, 0] },
  ]);
}

const SPRING_7_GRID_IMAGE_COUNT = 6;

/** «Дарданеллы» (spring-7): clip1, view2, clip2, yarchill, exit2, camp. */
export function buildSpring7DardanellesBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout(
    'buildSpring7DardanellesBentoLayout',
    gridImages,
    SPRING_7_GRID_IMAGE_COUNT,
    [
      { type: 'bento-vert', indices: [0, 1] },
      { type: 'bento-right', indices: [3, 4, 2] },
      { type: 'bento-single', indices: [5] },
    ]
  );
}

const SPRING_8_GRID_IMAGE_COUNT = 5;

/** «Фалаза» (spring-8): top, view2, clip1, top2, love_actually. */
export function buildSpring8FalazaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildSpring8FalazaBentoLayout', gridImages, SPRING_8_GRID_IMAGE_COUNT, [
    { type: 'bento-wide-square', indices: [0] },
    { type: 'bento-left', indices: [2, 1, 3] },
    { type: 'bento-wide-square', indices: [4] },
  ]);
}

const SPRING_9_GRID_IMAGE_COUNT = 9;

/** «Воробей + дегустация» (spring-9): top, view2, clip1, rocks, clip2, forest, clip3, sign, top2. */
export function buildSpring9VorobeyBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout('buildSpring9VorobeyBentoLayout', gridImages, SPRING_9_GRID_IMAGE_COUNT, [
    { type: 'bento-left', indices: [2, 0, 1] },
    { type: 'bento-right', indices: [3, 5, 4] },
    { type: 'bento-left', indices: [6, 7, 8] },
  ]);
}

const SPRING_10_GRID_IMAGE_COUNT = 9;

/**
 * «Аскольд» (spring-10). `slice(2)`: intro, clip2, clip4, clip5, clip6, beacon, rock, view2, view3.
 * clip2 [1] в сетке не показываем — как в `TourDetailGallery`.
 */
export function buildSpring10AskoldBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  const tallPanorama = TOUR_SPRING_10_GALLERY_TALL_PANORAMA_OBJECT_CLASS;
  return buildIndexedBentoLayout('buildSpring10AskoldBentoLayout', gridImages, SPRING_10_GRID_IMAGE_COUNT, [
    {
      type: 'bento-single',
      indices: [8],
      objectPositionByIndex: { 8: tallPanorama },
    },
    { type: 'bento-left', indices: [0, 6, 3] },
    {
      type: 'bento-right',
      indices: [2, 7, 5],
      objectPositionByIndex: { 7: tallPanorama },
    },
    { type: 'bento-single', indices: [4] },
  ]);
}

const SUMMER_1_GRID_IMAGE_COUNT = 15;

/**
 * «Та-Чингоуза» (summer-1). После `slice(2)` 15 кадров.
 * clip4 в вертикали — кадрирование по индексу [5].
 */
export function buildSummer1TachingouzaBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout(
    'buildSummer1TachingouzaBentoLayout',
    gridImages,
    SUMMER_1_GRID_IMAGE_COUNT,
    [
      { type: 'bento-single', indices: [3] },
      { type: 'bento-left', indices: [0, 4, 9] },
      {
        type: 'bento-left',
        indices: [1, 5, 6],
        objectPositionByIndex: { 5: TOUR_SUMMER_1_CLIP4_GRID_VIDEO_OBJECT_CLASS },
      },
      { type: 'bento-single', indices: [2] },
      { type: 'bento-left', indices: [7, 8, 10] },
      { type: 'bento-single', indices: [11] },
      { type: 'bento-vert', indices: [12, 13] },
      { type: 'bento-wide-square', indices: [14] },
    ]
  );
}

const SUMMER_7_GRID_IMAGE_COUNT = 11;

/**
 * «Северное Приморье» (summer-7).
 * `slice(2)`: clip1, dub, clip2, skal-point3, skal-34..46, clip3, clip4, fin.
 */
export function buildSummer7SeverCoastBentoLayout(
  gridImages: string[]
): TourBentoGalleryLayout {
  return buildIndexedBentoLayout(
    'buildSummer7SeverCoastBentoLayout',
    gridImages,
    SUMMER_7_GRID_IMAGE_COUNT,
    [
      { type: 'bento-left', indices: [0, 1, 2] },
      { type: 'bento-single', indices: [3] },
      { type: 'bento-vert', indices: [4, 5] },
      { type: 'bento-vert', indices: [6, 7] },
      { type: 'bento-vert', indices: [8, 9] },
      { type: 'bento-single', indices: [10] },
    ]
  );
}

export const TOUR_BENTO_LAYOUT_BUILDER_IDS = [
  'winter-1',
  'winter-2',
  'winter-3',
  'winter-4',
  'winter-5',
  'spring-1',
  'spring-2',
  'spring-3',
  'spring-4',
  'spring-5',
  'spring-6',
  'spring-7',
  'spring-8',
  'spring-9',
  'spring-10',
  'spring-11',
  'spring-12',
  'spring-13',
  'summer-1',
  'summer-7',
  'summer-8',
  'summer-9',
  'summer-10',
  'summer-11',
  'summer-14',
] as const;

export type TourBentoLayoutBuilderId = (typeof TOUR_BENTO_LAYOUT_BUILDER_IDS)[number];

const tourBentoLayoutBuilders: Record<
  TourBentoLayoutBuilderId,
  (gridImages: string[]) => TourBentoGalleryLayout
> = {
  'winter-1': buildWinter1IzubrinayaBentoLayout,
  'winter-2': buildWinter2GolecBentoLayout,
  'winter-3': buildWinter3GribanovkaBentoLayout,
  'winter-4': buildWinter4HuskyBentoLayout,
  'winter-5': buildWinter5ArsgoraBentoLayout,
  'spring-1': buildSpring1LysyDedBentoLayout,
  'spring-2': buildSpring2OlkhovayaBentoLayout,
  'spring-3': buildSpring3PidanBentoLayout,
  'spring-4': buildSpring4SestraBentoLayout,
  'spring-5': buildSpring5ChitindzuBentoLayout,
  'spring-6': buildSpring6MaralyDrakonyBentoLayout,
  'spring-7': buildSpring7DardanellesBentoLayout,
  'spring-8': buildSpring8FalazaBentoLayout,
  'spring-9': buildSpring9VorobeyBentoLayout,
  'spring-10': buildSpring10AskoldBentoLayout,
  'spring-11': buildSpring11ShkotaBentoLayout,
  'spring-12': buildSpring12TobizinaBentoLayout,
  'spring-13': buildSpring13GamovaBentoLayout,
  'summer-1': buildSummer1TachingouzaBentoLayout,
  'summer-7': buildSummer7SeverCoastBentoLayout,
  'summer-8': buildSummer8CrabbeBentoLayout,
  'summer-9': buildSummer9NeozhidannyBentoLayout,
  'summer-10': buildSummer10EzhSestraBentoLayout,
  'summer-11': buildSummer11RelaxBentoLayout,
  'summer-14': buildSummer14PetrovaBentoLayout,
};

export function buildTourBentoLayoutForId(
  tourId: TourBentoLayoutBuilderId,
  gridImages: string[]
): TourBentoGalleryLayout {
  return tourBentoLayoutBuilders[tourId](gridImages);
}
