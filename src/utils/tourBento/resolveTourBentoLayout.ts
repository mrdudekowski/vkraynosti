import type { Tour } from '../../types';
import type { TourBentoGalleryLayout } from '../../types/tourBento';
import {
  buildFallbackSinglesBentoLayout,
  buildTourBentoLayoutForId,
  TOUR_BENTO_LAYOUT_BUILDER_IDS,
  type TourBentoLayoutBuilderId,
} from '../../data/tourBentoLayouts';

function isTourBentoLayoutBuilderId(id: string): id is TourBentoLayoutBuilderId {
  return (TOUR_BENTO_LAYOUT_BUILDER_IDS as readonly string[]).includes(id);
}

/**
 * Data-driven bento для страницы тура.
 * Приоритет: `tour.bentoLayout` → builder по `tour.id` → builder по `contentSourceTourId`
 * → одиночные блоки на остаток сетки (заглушки).
 */
export function resolveTourBentoLayout(
  tour: Tour,
  gridImages: string[]
): TourBentoGalleryLayout | undefined {
  if (tour.bentoLayout != null) {
    return tour.bentoLayout;
  }

  if (gridImages.length === 0) {
    return undefined;
  }

  const layoutTourId = tour.contentSourceTourId ?? tour.id;
  if (isTourBentoLayoutBuilderId(layoutTourId)) {
    return buildTourBentoLayoutForId(layoutTourId, gridImages);
  }

  return buildFallbackSinglesBentoLayout(gridImages);
}
