import type { CmsTourLayoutPatch } from '../cms/applyTourLayoutPatch';
import type { CmsTourTextPatch } from '../cms/applyTourTextPatch';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { persistTourDescriptionColumns } from '../utils/splitTourDescription';

export function layoutFromDocument(document: CmsTourDocument): CmsTourLayoutPatch {
  return {
    coverAssetId: document.coverAssetId,
    coverCrop: document.coverCrop ?? {},
    bento: {
      blocks: document.bento.blocks.map((block) => ({
        type: block.type,
        slots: block.slots.map((slot) => ({
          assetId: slot.assetId,
          ...(slot.objectPosition != null && slot.objectPosition.length > 0
            ? { objectPosition: slot.objectPosition }
            : {}),
        })),
      })),
    },
  };
}

function textPatchFromDocument(document: CmsTourDocument): CmsTourTextPatch {
  return {
    title: document.title,
    slug: document.slug,
    subtitle: document.subtitle,
    heroPhrase: document.heroPhrase,
    duration: document.duration,
    durationDays: document.durationDays,
    difficulty: document.difficulty,
    difficultyDisplayLabel: document.difficultyDisplayLabel ?? '',
    metaAudienceLabel: document.metaAudienceLabel ?? '',
    price: document.price,
    pricePrevious: document.pricePrevious ?? '',
    priceFootnote: document.priceFootnote ?? '',
    seoDescription: document.seoDescription ?? '',
    description: document.description,
    descriptionLeadBold: document.descriptionLeadBold ?? '',
    descriptionAside: document.descriptionAside ?? '',
    prefaceAssetId: document.prefaceAssetId,
    included: document.included.map((item) => ({
      text: item.text,
      iconKey: item.iconKey,
    })),
    program: document.program.map((step) => ({
      timeLabel: step.timeLabel,
      description: step.description,
    })),
    programAdditionalNotes: [...(document.programAdditionalNotes ?? [])],
    assetAlts: Object.fromEntries(document.assets.map((asset) => [asset.id, asset.alt])),
  };
}

export function storedTextPatchFromDocument(document: CmsTourDocument): CmsTourTextPatch {
  return textPatchFromDocument(document);
}

export function patchFromDocument(document: CmsTourDocument): CmsTourTextPatch {
  const patch = textPatchFromDocument(document);
  const columns = persistTourDescriptionColumns(patch.description, patch.descriptionAside);
  return {
    ...patch,
    description: columns.description,
    descriptionAside: columns.descriptionAside ?? '',
  };
}
