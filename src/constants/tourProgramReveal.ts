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

/** Классы fade in/out для пункта программы и связанного текста секции. */
export function getTourProgramStepRevealClassName(isVisible: boolean): string {
  return [
    'reveal-program-step-base',
    isVisible ? 'reveal-program-step-visible' : 'reveal-program-step-hidden',
  ].join(' ');
}

export function isTourProgramStepExitPhase(
  mountedStepCount: number,
  revealedCount: number
): boolean {
  return mountedStepCount > revealedCount;
}

export function isTourProgramFooterExitPhase(
  mountedFooter: boolean,
  showProgramFooter: boolean
): boolean {
  return mountedFooter && !showProgramFooter;
}

/** Индекс пункта программы для ref track: во время fade-out — первый скрываемый. */
export function getTourProgramActiveStepRefIndex(options: {
  revealedCount: number;
  mountedStepCount: number;
  showProgramFooter: boolean;
  mountedFooter: boolean;
  programRevealEnabled: boolean;
}): number | null {
  const {
    revealedCount,
    mountedStepCount,
    showProgramFooter,
    mountedFooter,
    programRevealEnabled,
  } = options;

  if (!programRevealEnabled || revealedCount <= 0) {
    return null;
  }

  if (showProgramFooter || isTourProgramFooterExitPhase(mountedFooter, showProgramFooter)) {
    return null;
  }

  if (isTourProgramStepExitPhase(mountedStepCount, revealedCount)) {
    return revealedCount;
  }

  return revealedCount - 1;
}

export function shouldAttachTourProgramFooterRef(options: {
  mountedFooter: boolean;
  showProgramFooter: boolean;
  programRevealEnabled: boolean;
}): boolean {
  const { mountedFooter, showProgramFooter, programRevealEnabled } = options;

  if (!programRevealEnabled || !mountedFooter) {
    return false;
  }

  return showProgramFooter || isTourProgramFooterExitPhase(mountedFooter, showProgramFooter);
}

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
