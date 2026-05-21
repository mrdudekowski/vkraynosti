const FALL_TOUR_ID = /^fall-(\d+)$/;

/**
 * Летние туры с тем же контентом маршрута, что у парного весеннего.
 * Медиа — отдельные папки `public/tours/summer-N/` (не spring URL).
 */
export const SUMMER_CONTENT_SOURCE_PAIRS = {
  'summer-2': 'spring-12',
  'summer-3': 'spring-10',
  'summer-4': 'spring-11',
  'summer-5': 'spring-13',
  'summer-6': 'spring-7',
} as const satisfies Record<string, string>;

export type SummerContentSourceTourId = keyof typeof SUMMER_CONTENT_SOURCE_PAIRS;

/**
 * Id весеннего тура-источника контента и bento-layout (не для путей медиа).
 * `fall-N` → `spring-N`; летние пары — из `SUMMER_CONTENT_SOURCE_PAIRS`.
 */
export function resolveContentSourceTourId(tourId: string): string | undefined {
  const fallMatch = FALL_TOUR_ID.exec(tourId);
  if (fallMatch != null) {
    return `spring-${fallMatch[1]}`;
  }

  if (tourId in SUMMER_CONTENT_SOURCE_PAIRS) {
    return SUMMER_CONTENT_SOURCE_PAIRS[tourId as SummerContentSourceTourId];
  }

  return undefined;
}
