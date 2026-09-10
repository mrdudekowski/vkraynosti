/**
 * Диагональная сетка баннера: параллелограммы на всю высоту контейнера (10 равных долей по верхнему краю).
 * Угол φ бокового ребра к горизонтали в пикселях задаётся константой (φ меньше 45° — мягче «чистой» диагонали).
 * Сдвиг по X между верхом и низом полосы: `(H/W)·100% / tan(φ)` (см. `computeHomeSeasonBannerDiagonalShiftXPercent`).
 */

import { UI } from './ui';

const BAND_COUNT = [...UI.homeSeasonBannerWordmark].length;

if (import.meta.env.DEV && BAND_COUNT !== 10) {
  console.error('homeSeasonBannerDiagonalGrid: ожидается 10 букв в UI.homeSeasonBannerWordmark');
}

/** Базовый z-index ячейки; к индексу полосы добавляется для порядка перекрытия по диагонали. */
export const HOME_SEASON_BANNER_DIAGONAL_Z_BASE = 3 as const;

/** Z-index колонки при crossfade «входящая поверх» (как прежний `z-10` у колонки). */
export const HOME_SEASON_BANNER_DIAGONAL_Z_LIFT = 20 as const;

/**
 * Угол бокового ребра к горизонтали (градусы). Меньше 45° — пологее диагональ относительно 45°-случая.
 */
export const HOME_SEASON_BANNER_DIAGONAL_EDGE_ANGLE_DEG = 34 as const;

/**
 * Горизонтальный сдвиг (в % ширины reference box) между y=0 и y=100% для заданного H/W и угла φ.
 */
export function computeHomeSeasonBannerDiagonalShiftXPercent(
  heightOverWidth: number,
  angleDeg: number
): number {
  const rad = (angleDeg * Math.PI) / 180;
  const t = Math.tan(rad);
  if (!Number.isFinite(t) || t <= 0) {
    return 0;
  }
  return (heightOverWidth * 100) / t;
}

/**
 * Полоса `bandIndex`: верх [t0,t1], низ [b0,b1] по X (% ширины).
 */
export function homeSeasonBannerDiagonalBandClipPath(
  bandIndex: number,
  heightOverWidth: number
): string {
  if (bandIndex < 0 || bandIndex >= BAND_COUNT) {
    return 'none';
  }
  if (!Number.isFinite(heightOverWidth) || heightOverWidth <= 0) {
    return 'none';
  }
  const wBand = 100 / BAND_COUNT;
  const t0 = bandIndex * wBand;
  const t1 = (bandIndex + 1) * wBand;
  const shiftXPercent = computeHomeSeasonBannerDiagonalShiftXPercent(
    heightOverWidth,
    HOME_SEASON_BANNER_DIAGONAL_EDGE_ANGLE_DEG
  );
  const b0 = t0 + shiftXPercent;
  const b1 = t1 + shiftXPercent;
  return `polygon(${String(t0)}% 0%, ${String(t1)}% 0%, ${String(b1)}% 100%, ${String(b0)}% 100%)`;
}
