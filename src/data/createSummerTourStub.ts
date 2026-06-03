import type { Tour } from '../types';
import type { SummerTourStubMediaBundle } from '../constants/summerTourStubMedia';

export type CreateSummerTourStubParams = {
  id: Tour['id'];
  title: string;
  duration: string;
  difficulty: Tour['difficulty'];
  difficultyDisplayLabel?: string;
  media: SummerTourStubMediaBundle;
};

/**
 * Заглушка тура в каталоге до наполнения программой, ценой и финальной галереей.
 * Страница тура — режим `inDevelopment` (hero + анонс).
 */
export function createSummerTourStub({
  id,
  title,
  duration,
  difficulty,
  difficultyDisplayLabel,
  media,
}: CreateSummerTourStubParams): Tour {
  return {
    id,
    season: 'summer',
    title,
    subtitle: 'Программа и детали будут опубликованы',
    heroPhrase: title,
    duration,
    difficulty,
    difficultyDisplayLabel,
    price: 'по запросу',
    priceFootnote: 'Актуальную стоимость сообщим по запросу.',
    description: 'Описание маршрута готовится.',
    program: [],
    includedInPrice: [],
    imageUrl: media.coverGrid,
    prefaceBackgroundImageUrl: media.prefaceBackground,
    galleryImages: [...media.galleryViewer],
    galleryGridUrls: [...media.galleryGrid],
  };
}
