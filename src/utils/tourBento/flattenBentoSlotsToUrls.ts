import type { BentoBlock, TourBentoGalleryLayout } from '../../types/tourBento';

function isBentoBlockArray(
  value: TourBentoGalleryLayout | readonly BentoBlock[]
): value is readonly BentoBlock[] {
  return Array.isArray(value) && (value.length === 0 || 'type' in value[0]);
}

/** Плоский список URL в порядке blocks → slots (1…n внутри блока). */
export function flattenBentoSlotsToUrls(
  layout: TourBentoGalleryLayout | readonly BentoBlock[]
): string[] {
  const blocks = isBentoBlockArray(layout) ? layout : layout.blocks;
  return blocks.flatMap((block: BentoBlock) =>
    block.slots.map((slot: BentoBlock['slots'][number]) => slot.src)
  );
}
