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
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  /**
   * Если задано, на карточке и в мета-блоке страницы тура показывается этот текст
   * вместо уровня сложности (например, «для новичков и опытных»).
   */
  metaAudienceLabel?: string;
  price: string;
  /** Зачёркнутая «старая» цена под основной (например, до обновления прайса). */
  pricePrevious?: string;
  /** Подпись под блоком стоимости вместо стандартной из `UI.tourDetail.priceHighlightNote`. */
  priceFootnote?: string;
  /** Основной текст блока «О туре». */
  description: string;
  /** Необязательный вводной фрагмент перед `description` (жирный, напр. название с высотой). */
  descriptionLeadBold?: string;
  program: TourProgramStep[];
  /** Доп. примечания под программой (после общего дисклеймера о времени). */
  programAdditionalNotes?: string[];
  includedInPrice: TourIncludedItem[];
  imageUrl: string;
  /**
   * Канонический порядок медиа: полное качество для просмотрщика и префейса по индексу.
   * Длина совпадает с `galleryGridUrls`, если он задан.
   */
  galleryImages: string[];
  /**
   * Оптимизированные URL для сетки страницы тура и карточек (webp / VP9 webm).
   * При отсутствии для сетки используется `galleryImages`.
   */
  galleryGridUrls?: string[];
  /**
   * Явный список URL для полноэкранного просмотра; иначе — `galleryImages`.
   */
  galleryViewerUrls?: string[];
  /**
   * Если задано — фон блока «О туре» (`tour-detail-preface-bg`) вместо `galleryImages[1]`.
   * URL из `src/constants/images.ts` или того же массива, что и `galleryImages`.
   */
  prefaceBackgroundImageUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  experience: string;
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
  | { type: 'teamMember'; payload: TeamMember }
  | { type: 'tourRequest'; payload: TourRequestModalPayload };
