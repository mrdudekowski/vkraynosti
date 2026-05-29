import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface TourProgramStep {
  timeLabel: string;
  description: string;
}

/** Пункт блока «Что включено»: текст и иконка Font Awesome (импорт иконок с `@fortawesome/free-solid-svg-icons/fa…`). */
export interface TourIncludedItem {
  text: string;
  icon: IconDefinition;
}

export interface Tour {
  id: string;
  season: 'winter' | 'spring' | 'summer' | 'fall';
  title: string;
  subtitle: string;
  heroPhrase: string;
  /** @deprecated для UI — `durationTypes` из расписания / `useTourDisplayDuration`. */
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  /**
   * Если задано, на карточке и в мета-блоке страницы тура показывается этот текст
   * вместо `UI.difficulty.labels[difficulty]`. Диапазоны — `formatDifficultyRangeLabel`;
   * канон подписей — `UI.difficulty.labels` / `UI.difficulty.customLabels`.
   */
  metaAudienceLabel?: string;
  /**
   * Текст сложности под заголовком «Сложность» (`UI.tourDetail.metaLabelDifficulty`) в мета-блоке
   * и в чипе карточки. Не сочетать с `metaAudienceLabel`. Резолв в UI — `resolveTourDifficultyLabel`.
   */
  difficultyDisplayLabel?: string;
  price: string;
  /** Зачёркнутая «старая» цена под основной (например, до обновления прайса). */
  pricePrevious?: string;
  /** Подпись под блоком стоимости вместо стандартной из `UI.tourDetail.priceHighlightNote`. */
  priceFootnote?: string;
  /** Основной текст блока «О туре». */
  description: string;
  /** Необязательный вводной фрагмент перед `description` (жирный, напр. название с высотой). */
  descriptionLeadBold?: string;
  /** Необязательный дополнительный текст для правой колонки верхнего блока деталей тура. */
  descriptionAside?: string;
  program: TourProgramStep[];
  /** Доп. примечания под программой (после общего дисклеймера о времени). */
  programAdditionalNotes?: string[];
  includedInPrice: TourIncludedItem[];
  imageUrl: string;
  /**
   * Канонический порядок still-медиа галереи (webp; на слотах видео — poster кадр, не `.webm`).
   * Длина совпадает с `galleryGridUrls`, если он задан.
   */
  galleryImages: string[];
  /**
   * URL для сетки страницы тура: те же фото, на видео-слотах — VP9 `*.grid.webm`.
   * При отсутствии для сетки используется `galleryImages`.
   */
  galleryGridUrls?: string[];
  /**
   * Если задано — фон блока «О туре» (`tour-detail-preface-bg`) вместо `galleryImages[1]`.
   * URL из `src/constants/images.ts` или того же массива, что и `galleryImages` (только webp).
   */
  prefaceBackgroundImageUrl?: string;
  /**
   * Весенний тур с тем же маршрутом (контент, bento-layout).
   * Медиа всегда из папки `public/tours/{id}/` этого тура, не из source.
   */
  contentSourceTourId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  experience?: string;
  /** По умолчанию true; `false` скрывает строку опыта на слайде. */
  showExperienceLine?: boolean;
  imageUrl: string;
}

export interface SafetyItem {
  id: string;
  icon: string;
  title: string;
  summary: string;
  details: string;
}

export type Season = 'winter' | 'spring' | 'summer' | 'fall';

/** Данные тура для формы заявки (без полного объекта Tour). */
export interface TourRequestModalPayload {
  tourId: string;
  title: string;
  subtitle?: string;
  season?: Season;
}

export type ModalState =
  | { type: null }
  | { type: 'tourRequest'; payload: TourRequestModalPayload };
