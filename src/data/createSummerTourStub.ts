import type { Tour } from '../types';
import type { SummerTourStubMediaBundle } from '../constants/summerTourStubMedia';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faShuttleVan } from '@fortawesome/free-solid-svg-icons/faShuttleVan';
import { faUserTie } from '@fortawesome/free-solid-svg-icons/faUserTie';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';

const inc = (text: string, icon: IconDefinition = faCheck) => ({ text, icon });

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
    description:
      'Описание маршрута готовится. Скоро здесь появится программа, условия участия и галерея.',
    program: [{ timeLabel: '—', description: 'Программа уточняется.' }],
    programAdditionalNotes: ['Расписание и тайминг могут измениться.'],
    includedInPrice: [
      inc('Трансфер туда и обратно', faShuttleVan),
      inc('Сопровождение команды Вкрайности', faUserTie),
      inc('Организация маршрута и наша забота в поездке', faHeart),
    ],
    imageUrl: media.coverGrid,
    prefaceBackgroundImageUrl: media.prefaceBackground,
    galleryImages: [...media.galleryViewer],
    galleryGridUrls: [...media.galleryGrid],
  };
}
