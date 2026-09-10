import { z } from 'zod';
import {
  BENTO_BLOCK_TYPES,
  getBentoBlockSlotCount,
  type BentoBlockType,
} from '../constants/tourBento';

export { BENTO_BLOCK_TYPES, type BentoBlockType };

export interface BentoMediaSlot {
  /** URL grid (webp poster или webm) — канон из images.ts / CDN */
  src: string;
  alt?: string;
  objectPosition?: string;
  objectFit?: 'cover';
}

export interface BentoBlock {
  type: BentoBlockType;
  slots: BentoMediaSlot[];
}

export interface TourBentoGalleryLayout {
  blocks: BentoBlock[];
}

const bentoMediaSlotSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional(),
  objectPosition: z.string().optional(),
  objectFit: z.literal('cover').optional(),
});

const bentoBlockSchema = z.object({
  type: z.enum(BENTO_BLOCK_TYPES),
  slots: z.array(bentoMediaSlotSchema),
});

export const tourBentoGalleryLayoutSchema = z
  .object({
    blocks: z.array(bentoBlockSchema),
  })
  .superRefine((layout, ctx) => {
    layout.blocks.forEach((block, blockIndex) => {
      const expected = getBentoBlockSlotCount(block.type);
      if (block.slots.length !== expected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Bento block "${block.type}" at index ${blockIndex} expects ${expected} slots, got ${block.slots.length}`,
          path: ['blocks', blockIndex, 'slots'],
        });
      }
    });
  });

export type TourBentoGalleryLayoutInput = z.input<typeof tourBentoGalleryLayoutSchema>;
