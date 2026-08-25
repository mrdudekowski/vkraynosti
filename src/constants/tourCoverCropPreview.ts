/**
 * Пропорции превью обложки в админке — те же рамки, что на сайте.
 * Карточка: `max-w-tour-card` × `h-48`. Hero вертикальный — кадр телефона.
 * Hero большой — типичное соотношение ширины lg+ к `h-tour-detail-hero`.
 */

/** Ширина карточки тура (`max-w-tour-card`). */
export const TOUR_CARD_MAX_WIDTH_REM = 22 as const;

/** Высота фото на карточке (`h-48`). */
export const TOUR_CARD_COVER_HEIGHT_REM = 12 as const;

export const TOUR_CARD_COVER_ASPECT_RATIO =
  `${TOUR_CARD_MAX_WIDTH_REM} / ${TOUR_CARD_COVER_HEIGHT_REM}` as const;

/** Вертикальный hero / карусель на телефоне. */
export const TOUR_COVER_HERO_PHONE_ASPECT_RATIO = '9 / 16' as const;

/** Ширина превью телефона в редакторе — чтобы точка кадра оставалась крупной. */
export const TOUR_COVER_PREVIEW_PHONE_MAX_WIDTH_REM = 12 as const;

/** Hero на большом экране (~ширина lg+ к `clamp(28rem, 58vh, 48rem)`). */
export const TOUR_COVER_HERO_LG_ASPECT_RATIO = '11 / 4' as const;

/** Виртуальная ширина телефона, с которой масштабируется подпись hero в превью. */
export const TOUR_COVER_HERO_PHONE_STAGE_WIDTH_PX = 390 as const;

/** Виртуальная ширина большого экрана для того же превью. */
export const TOUR_COVER_HERO_LG_STAGE_WIDTH_PX = 1280 as const;

export function tourCoverHeroStageHeightPx(
  stageWidthPx: number,
  frame: 'phone' | 'lg',
): number {
  if (frame === 'phone') {
    return (stageWidthPx * 16) / 9;
  }
  return (stageWidthPx * 4) / 11;
}
