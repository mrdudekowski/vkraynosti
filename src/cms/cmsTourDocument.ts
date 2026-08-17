import { z } from 'zod';
import { BENTO_BLOCK_TYPES, getBentoBlockSlotCount } from '../constants/tourBento';
import { TOUR_GALLERY_LAYOUT_VARIANTS } from '../constants/tourGalleryLayoutVariant';

export const CMS_TOURS_SCHEMA_VERSION = 1 as const;

export const cmsTourAssetSchema = z.object({
  id: z.string().min(1),
  stillUrl: z.string().min(1),
  videoUrl: z.string().min(1).nullable(),
  alt: z.string().default(''),
});

export const cmsBentoSlotSchema = z.object({
  assetId: z.string().min(1).nullable(),
  objectPosition: z.string().optional(),
});

export const cmsBentoBlockSchema = z
  .object({
    type: z.enum(BENTO_BLOCK_TYPES),
    slots: z.array(cmsBentoSlotSchema),
  })
  .superRefine((block, ctx) => {
    const expected = getBentoBlockSlotCount(block.type);
    if (block.slots.length !== expected) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Bento block "${block.type}" expects ${expected} slots, got ${block.slots.length}`,
        path: ['slots'],
      });
    }
  });

export const cmsMediaFocalPointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

export const cmsCoverCropSchema = z.object({
  card: cmsMediaFocalPointSchema.optional(),
  hero: cmsMediaFocalPointSchema.optional(),
  heroLg: cmsMediaFocalPointSchema.optional(),
});

export const cmsTourDocumentSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  season: z.enum(['winter', 'spring', 'summer', 'fall']),
  status: z.enum(['draft', 'in_development', 'active', 'hidden']).default('draft'),
  title: z.string().min(1),
  subtitle: z.string().default(''),
  heroPhrase: z.string().default(''),
  description: z.string().default(''),
  descriptionLeadBold: z.string().optional(),
  descriptionAside: z.string().optional(),
  duration: z.string().default(''),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Expert']).default('Medium'),
  difficultyDisplayLabel: z.string().optional(),
  metaAudienceLabel: z.string().optional(),
  price: z.string().default(''),
  pricePrevious: z.string().optional(),
  priceFootnote: z.string().optional(),
  program: z
    .array(z.object({ timeLabel: z.string(), description: z.string() }))
    .default([]),
  programAdditionalNotes: z.array(z.string()).optional(),
  included: z.array(z.object({ text: z.string(), iconKey: z.string().min(1) })).default([]),
  seoDescription: z.string().optional(),
  contentSourceTourId: z.string().min(1).optional(),
  coverAssetId: z.string().min(1).nullable(),
  prefaceAssetId: z.string().min(1).nullable(),
  coverCrop: cmsCoverCropSchema.optional(),
  assets: z.array(cmsTourAssetSchema),
  bento: z.object({
    blocks: z.array(cmsBentoBlockSchema),
  }),
  /**
   * Заполнено, если сетка ещё в `TourDetailGallery` (не data-driven bento).
   * `null` — галерея из `bento.blocks`.
   */
  legacyGalleryVariant: z.enum(TOUR_GALLERY_LAYOUT_VARIANTS).nullable().default(null),
});

export const cmsToursFileSchema = z.object({
  schemaVersion: z.literal(CMS_TOURS_SCHEMA_VERSION),
  tours: z.array(cmsTourDocumentSchema),
});

export type CmsTourAsset = z.infer<typeof cmsTourAssetSchema>;
export type CmsBentoSlot = z.infer<typeof cmsBentoSlotSchema>;
export type CmsBentoBlock = z.infer<typeof cmsBentoBlockSchema>;
export type CmsCoverCrop = z.infer<typeof cmsCoverCropSchema>;
export type CmsTourDocument = z.infer<typeof cmsTourDocumentSchema>;
export type CmsToursFile = z.infer<typeof cmsToursFileSchema>;

export function parseCmsToursFile(input: unknown): CmsToursFile {
  return cmsToursFileSchema.parse(input);
}
