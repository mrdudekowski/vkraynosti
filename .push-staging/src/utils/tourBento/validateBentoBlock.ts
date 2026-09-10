import {
  tourBentoGalleryLayoutSchema,
  type TourBentoGalleryLayout,
  type TourBentoGalleryLayoutInput,
} from '../../types/tourBento';

export function validateTourBentoGalleryLayout(
  input: TourBentoGalleryLayoutInput
): TourBentoGalleryLayout {
  return tourBentoGalleryLayoutSchema.parse(input);
}

export function assertBentoBlockSlotCount(
  type: TourBentoGalleryLayout['blocks'][number]['type'],
  slotCount: number
): void {
  tourBentoGalleryLayoutSchema.parse({
    blocks: [{ type, slots: Array.from({ length: slotCount }, () => ({ src: '/placeholder' })) }],
  });
}
