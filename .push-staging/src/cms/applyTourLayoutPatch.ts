import type { TourCoverCrop } from '../utils/mediaObjectPosition';
import {
  getBentoBlockSlotCount,
  isBentoBlockType,
  type BentoBlockType,
} from '../constants/tourBento';
import { cmsTourDocumentSchema, type CmsTourDocument } from './cmsTourDocument';

export type CmsTourLayoutPatch = {
  coverAssetId: string | null;
  coverCrop?: TourCoverCrop;
  bento: {
    blocks: Array<{
      type: BentoBlockType;
      slots: Array<{ assetId: string | null; objectPosition?: string }>;
    }>;
  };
};

function compactCoverCrop(crop: TourCoverCrop | undefined): TourCoverCrop | undefined {
  if (crop == null) {
    return undefined;
  }
  const next: TourCoverCrop = {
    ...(crop.card != null ? { card: crop.card } : {}),
    ...(crop.hero != null ? { hero: crop.hero } : {}),
    ...(crop.heroLg != null ? { heroLg: crop.heroLg } : {}),
  };
  return next.card != null || next.hero != null || next.heroLg != null ? next : undefined;
}

/**
 * Меняет обложку и сетку bento. Тексты и список assets не трогает.
 * Обложка и предисловие не обязаны быть в слотах — это правило пула в UI.
 */
export function applyTourLayoutPatch(
  document: CmsTourDocument,
  patch: CmsTourLayoutPatch
): CmsTourDocument {
  const assetIds = new Set(document.assets.map((asset) => asset.id));
  const coverAssetId = patch.coverAssetId;
  if (coverAssetId != null && coverAssetId.length > 0 && !assetIds.has(coverAssetId)) {
    throw new Error(`Unknown cover asset "${coverAssetId}"`);
  }

  for (const block of patch.bento.blocks) {
    if (!isBentoBlockType(block.type)) {
      throw new Error(`Unknown bento type "${block.type}"`);
    }
    const expected = getBentoBlockSlotCount(block.type);
    if (block.slots.length !== expected) {
      throw new Error(`Bento block "${block.type}" expects ${expected} slots, got ${block.slots.length}`);
    }
    for (const slot of block.slots) {
      if (slot.assetId == null || slot.assetId.length === 0) {
        continue;
      }
      if (!assetIds.has(slot.assetId)) {
        throw new Error(`Unknown bento asset "${slot.assetId}"`);
      }
    }
  }

  const rest: CmsTourDocument = { ...document };
  delete rest.coverCrop;
  const coverCrop =
    patch.coverCrop !== undefined ? compactCoverCrop(patch.coverCrop) : compactCoverCrop(document.coverCrop);

  return cmsTourDocumentSchema.parse({
    ...rest,
    coverAssetId: coverAssetId != null && coverAssetId.length > 0 ? coverAssetId : null,
    ...(coverCrop != null ? { coverCrop } : {}),
    bento: {
      blocks: patch.bento.blocks.map((block) => ({
        type: block.type,
        slots: block.slots.map((slot) => ({
          assetId:
            slot.assetId != null && slot.assetId.length > 0 ? slot.assetId : null,
          ...(slot.objectPosition != null && slot.objectPosition.length > 0
            ? { objectPosition: slot.objectPosition }
            : {}),
        })),
      })),
    },
    legacyGalleryVariant: patch.bento.blocks.length > 0 ? null : document.legacyGalleryVariant,
  });
}

export function allocateUploadAssetId(existingIds: readonly string[]): string {
  const used = new Set(existingIds);
  let index = 1;
  while (used.has(`u-${index}`)) {
    index += 1;
  }
  return `u-${index}`;
}
