/** Канонический порядок карточек летних туров на сайте (до `sortToursInDevelopmentLast`). */
export const SUMMER_TOUR_DISPLAY_ORDER = [
  'summer-4',
  'summer-3',
  'summer-2',
  'summer-1',
  'summer-10',
  'summer-11',
  'summer-5',
  'summer-6',
  'summer-7',
  'summer-8',
  'summer-9',
] as const;

export type SummerTourDisplayOrderId = (typeof SUMMER_TOUR_DISPLAY_ORDER)[number];
