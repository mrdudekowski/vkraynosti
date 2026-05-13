/**
 * Вариант bento-сетки `TourDetailGallery` — задаётся по `tour.id` (не из данных тура),
 * чтобы не дублировать ветвление в `TourDetailPage`.
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
  | 'gamova';

export function getTourGalleryLayoutVariant(tourId: string): TourGalleryLayoutVariant {
  if (tourId === 'winter-1') return 'izubrinaya';
  if (tourId === 'winter-5') return 'arsgora';
  if (tourId === 'spring-1') return 'lysy-ded';
  if (tourId === 'spring-2') return 'olkhovaya';
  if (tourId === 'spring-3') return 'pidan';
  if (tourId === 'spring-4') return 'sestra';
  if (tourId === 'spring-5' || tourId === 'spring-6') return 'chitinza';
  if (tourId === 'spring-7') return 'dardanelles';
  if (tourId === 'spring-8') return 'falaza';
  if (tourId === 'spring-9') return 'vorobey-winery';
  if (tourId === 'spring-10') return 'askold';
  if (tourId === 'spring-11') return 'shkota';
  if (tourId === 'spring-13') return 'gamova';
  return 'default';
}
