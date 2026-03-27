import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface TourProgramStep {
  timeLabel: string;
  description: string;
}

/** Пункт блока «Что включено»: текст и иконка Font Awesome (`@fortawesome/free-solid-svg-icons`). */
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
  price: string;
  /** Основной текст блока «О туре». */
  description: string;
  /** Необязательный вводной фрагмент перед `description` (жирный, напр. название с высотой). */
  descriptionLeadBold?: string;
  program: TourProgramStep[];
  includedInPrice: TourIncludedItem[];
  imageUrl: string;
  galleryImages: string[];
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
