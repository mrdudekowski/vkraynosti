import type { CmsTourDocument } from './cmsTourDocument';

/**
 * Живой снимок для админки: per-tour файл, иначе запись в гостевом overlay-каталоге.
 * Overlay без per-tour файла — типичный импорт с витрины; это уже выпуск, не черновик.
 */
export function resolvePublishedTourDocument(
  perTour: CmsTourDocument | null | undefined,
  overlayTour: CmsTourDocument | null | undefined,
): CmsTourDocument | null {
  return perTour ?? overlayTour ?? null;
}
