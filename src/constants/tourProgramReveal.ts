/**
 * Расчёт progress раскрытия этапов программы тура по скроллу (только lg+, см. хук).
 * Если высота основной колонки меньше порога — считаем диапазон ненадёжным и показываем все этапы.
 */
export const TOUR_PROGRAM_REVEAL_MIN_RANGE_PX = 48 as const;

/**
 * Доля высоты основной колонки: когда низ viewport достигает `top + height * END_SHARE`,
 * progress = 1 (все этапы + footer). Меньше 1 — быстрее раскрытие при том же скролле.
 * Было неявно 1.0 (вся колонка «О туре» + галерея).
 */
export const TOUR_PROGRAM_REVEAL_END_SHARE = 0.4 as const;

/** Длительность появления пункта программы и сдвига track (только program-reveal, не глобальный reveal). */
export const TOUR_PROGRAM_REVEAL_ITEM_MS = 320 as const;

function clampUnit(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

export interface TourProgramRevealGeometry {
  /** `getBoundingClientRect().top` колонки в момент расчёта. */
  columnTopViewportPx: number;
  /** `getBoundingClientRect().height` колонки. */
  columnHeightPx: number;
  scrollY: number;
  viewportHeightPx: number;
}

/**
 * Сколько слотов раскрыто (этапы + footer): 0…itemCount.
 * Pure-функция для хука и unit-тестов.
 */
export function computeTourProgramRevealedItemCount(
  geometry: TourProgramRevealGeometry,
  itemCount: number
): number {
  if (itemCount <= 0) return 0;

  const { columnTopViewportPx, columnHeightPx, scrollY, viewportHeightPx } = geometry;
  if (viewportHeightPx <= 0 || columnHeightPx <= 0) return 0;

  const columnTopDoc = columnTopViewportPx + scrollY;
  const range = columnHeightPx;
  if (range < TOUR_PROGRAM_REVEAL_MIN_RANGE_PX) {
    return itemCount;
  }

  const revealEndDoc = columnTopDoc + range * TOUR_PROGRAM_REVEAL_END_SHARE;
  const revealStartDoc = columnTopDoc;
  const denom = revealEndDoc - revealStartDoc;
  if (denom <= 0) return itemCount;

  const viewportBottomDoc = scrollY + viewportHeightPx;
  const progress = clampUnit((viewportBottomDoc - revealStartDoc) / denom);
  return Math.min(itemCount, Math.ceil(progress * itemCount));
}
