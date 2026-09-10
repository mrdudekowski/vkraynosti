import type { Tour } from '../types';

/**
 * Stable public URL slugs keyed by tour.id (internal id, not slug).
 * Latin lowercase, words separated by hyphens — see `TOUR_SLUG_PATTERN` in tourUrls.ts.
 */
export const TOUR_SLUG_BY_ID = {
  'winter-1': 'voskhozhdenie-na-izyubrinuyu',
  'winter-2': 'voskhozhdenie-na-golets',
  'winter-3': 'gornolyzhnyy-uikend-falaza-gribanovka',
  'winter-4': 'khaski-poezdka',
  'winter-5': 'gornolyzhnyy-uikend-arsgora',
  'spring-1': 'voskhozhdenie-na-lysovogo-deda',
  'spring-2': 'voskhozhdenie-na-olkhovuyu',
  'spring-3': 'voskhozhdenie-na-pidan',
  'spring-4': 'voskhozhdenie-na-goru-sestra',
  'spring-5': 'voskhozhdenie-na-chitindzu',
  'spring-6': 'maraly-i-drakony',
  'spring-7': 'ushchele-dardanelly',
  'spring-8': 'voskhozhdenie-na-falazu',
  'spring-9': 'voskhozhdenie-na-vorobya',
  'spring-10': 'ostrov-askold',
  'spring-11': 'ostrov-shkota',
  'spring-12': 'mys-tobizina',
  'spring-13': 'poluostrov-gamova',
  'summer-1': 'zapovednaya-ta-chingouza',
  'summer-2': 'leto-mys-tobizina',
  'summer-3': 'leto-ostrov-askold',
  'summer-4': 'leto-ostrov-shkota',
  'summer-5': 'leto-poluostrov-gamova',
  'summer-6': 'leto-ushchele-dardanelly',
  'summer-7': 'severnoe-primorye-tainy-poberezhya',
  'summer-8': 'poluostrov-krabbe',
  'summer-9': 'vodopad-neozhidannyy',
  'summer-10': 'robinzonada-primorskoe-bali',
  'summer-11': 'relaks-v-buhte-ezhovoy',
  'summer-12': 'plyazh-trekh-granits',
  'summer-13': 'odin-den-v-ta-chingouze',
  'summer-14': 'ostrov-petrova',
  'summer-15': 'odin-den-v-dubovoy',
  'summer-16': 'robinzonada-krabbe-gamova',
  'summer-17': 'robinzonada-sever-primorya',
  'summer-19': 'robinzonada-plyazh-trekh-granits',
  'fall-1': 'osen-voskhozhdenie-na-lysovogo-deda',
  'fall-2': 'osen-voskhozhdenie-na-olkhovuyu',
  'fall-3': 'osen-voskhozhdenie-na-pidan',
  'fall-4': 'osen-voskhozhdenie-na-goru-sestra',
  'fall-5': 'osen-voskhozhdenie-na-chitindzu',
  'fall-6': 'osen-maraly-i-drakony',
  'fall-7': 'osen-ushchele-dardanelly',
  'fall-8': 'osen-voskhozhdenie-na-falazu',
  'fall-9': 'osen-voskhozhdenie-na-vorobya',
  'fall-10': 'osen-ostrov-askold',
  'fall-11': 'osen-ostrov-shkota',
  'fall-12': 'osen-mys-tobizina',
  'fall-13': 'osen-poluostrov-gamova',
} as const satisfies Record<string, string>;

export type TourSlugId = keyof typeof TOUR_SLUG_BY_ID;

/** Former public slugs → tour.id (301 to current slug in TourDetailPage). */
export const TOUR_SLUG_ALIAS_TO_TOUR_ID = {
  'robinzonada-v-rayone-tryokhi': 'summer-10',
} as const satisfies Record<string, TourSlugId>;

export function resolveTourSlugById(tourId: string): string | undefined {
  return TOUR_SLUG_BY_ID[tourId as TourSlugId];
}

export function applyTourSlug(tour: Tour): Tour {
  const slug = resolveTourSlugById(tour.id);
  if (slug == null) {
    throw new Error(`Missing slug for tour ${tour.id}`);
  }
  return { ...tour, slug };
}

export function applyTourSlugs(tours: readonly Tour[]): Tour[] {
  return tours.map(applyTourSlug);
}
