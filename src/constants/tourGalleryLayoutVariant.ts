import { resolveContentSourceTourId } from '../data/seasonTourRegistry';

/**
 * Вариант bento-сетки `TourDetailGallery` — по маршруту (`contentSourceTourId` или `tour.id`).
 */
export type TourGalleryLayoutVariant =
  | 'default'
  | 'izubrinaya'
  | 'arsgora'
  | 'lysy-ded'
  | 'olkhovaya'
  | 'pidan'
  | 'sestra'
  | 'chitinza'
  | 'falaza'
  | 'vorobey-winery'
  | 'dardanelles'
  | 'askold'
  | 'shkota'
  | 'gamova'
  | 'tachingouza'
  | 'severCoast';

export function getTourGalleryLayoutVariant(tourId: string): TourGalleryLayoutVariant {
  const layoutKey = resolveContentSourceTourId(tourId) ?? tourId;
  if (layoutKey === 'winter-1') return 'izubrinaya';
  if (layoutKey === 'winter-5') return 'arsgora';
  if (layoutKey === 'spring-1') return 'lysy-ded';
  if (layoutKey === 'spring-2') return 'olkhovaya';
  if (layoutKey === 'spring-3') return 'pidan';
  if (layoutKey === 'spring-4') return 'sestra';
  if (layoutKey === 'spring-5' || layoutKey === 'spring-6') return 'chitinza';
  if (layoutKey === 'spring-7') return 'dardanelles';
  if (layoutKey === 'spring-8') return 'falaza';
  if (layoutKey === 'spring-9') return 'vorobey-winery';
  if (layoutKey === 'spring-10') return 'askold';
  if (layoutKey === 'spring-11') return 'shkota';
  if (layoutKey === 'spring-13') return 'gamova';
  if (tourId === 'summer-1') return 'tachingouza';
  if (tourId === 'summer-7') return 'severCoast';
  return 'default';
}
