import { PUBLIC_ASSET_BASE } from './fonts';

const TOURS_ASSET_BASE = `${PUBLIC_ASSET_BASE}tours`;

export type SummerTourStubMediaBundle = {
  readonly assetBase: string;
  readonly coverGrid: string;
  readonly prefaceBackground: string;
  readonly galleryViewer: readonly string[];
  readonly galleryGrid: readonly string[];
};

/**
 * Минимальный набор медиа для нового летнего тура до финального прогона encode.
 * Файлы: `cover.webp`, `preface.webp`, `view.webp` в `public/tours/{tourId}/`.
 */
export function defineSummerTourStubMedia(
  tourId: `summer-${number}`
): SummerTourStubMediaBundle {
  const assetBase = `${TOURS_ASSET_BASE}/${tourId}`;
  const coverGrid = `${assetBase}/cover.webp`;
  const prefaceBackground = `${assetBase}/preface.webp`;
  const viewImage = `${assetBase}/view.webp`;
  const galleryViewer = [coverGrid, prefaceBackground, viewImage] as const;

  return {
    assetBase,
    coverGrid,
    prefaceBackground,
    galleryViewer,
    galleryGrid: galleryViewer,
  };
}

/** Один день в Та-Чингоузе (summer-13). */
export const TOUR_SUMMER_13_STUB = defineSummerTourStubMedia('summer-13');

/** Уникальный остров Петрова (summer-14). */
export const TOUR_SUMMER_14_STUB = defineSummerTourStubMedia('summer-14');

/** Один день в Дубовой (summer-15). */
export const TOUR_SUMMER_15_STUB = defineSummerTourStubMedia('summer-15');

/** Робинзонада Краббе х Гамова (summer-16). */
export const TOUR_SUMMER_16_STUB = defineSummerTourStubMedia('summer-16');

/** Робинзонада на Север Приморья (summer-17). */
export const TOUR_SUMMER_17_STUB = defineSummerTourStubMedia('summer-17');

/** Робинзонада на Пляж 3х Границ (summer-19). */
export const TOUR_SUMMER_19_STUB = defineSummerTourStubMedia('summer-19');
