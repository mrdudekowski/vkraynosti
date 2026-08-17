import type { Tour } from '../types';
import type { TourBentoGalleryLayout } from '../types/tourBento';
import type { CmsTourAsset, CmsTourDocument } from './cmsTourDocument';
import { resolveIncludedIcon } from './includedIconCatalog';

function assetById(document: CmsTourDocument, id: string | null): CmsTourAsset | undefined {
  if (id == null) {
    return undefined;
  }
  return document.assets.find((asset) => asset.id === id);
}

function gridSrc(asset: CmsTourAsset): string {
  return asset.videoUrl ?? asset.stillUrl;
}

function requireCover(document: CmsTourDocument): CmsTourAsset {
  const cover = assetById(document, document.coverAssetId);
  if (cover == null) {
    throw new Error(`CMS tour ${document.id} is missing cover asset`);
  }
  return cover;
}

function isFilledSlot(
  slot: CmsTourDocument['bento']['blocks'][number]['slots'][number]
): slot is CmsTourDocument['bento']['blocks'][number]['slots'][number] & { assetId: string } {
  return slot.assetId != null && slot.assetId.length > 0;
}

export function cmsDocumentToSiteTour(document: CmsTourDocument): Tour {
  const assets = new Map(document.assets.map((asset) => [asset.id, asset]));
  const cover = requireCover(document);
  const preface = assetById(document, document.prefaceAssetId);
  const completeBlocks = document.bento.blocks.filter((block) => block.slots.every(isFilledSlot));
  const hasBento = completeBlocks.length > 0;

  const bentoLayout: TourBentoGalleryLayout | undefined = hasBento
    ? {
        blocks: completeBlocks.map((block) => ({
          type: block.type,
          slots: block.slots.map((slot) => {
            const assetId = slot.assetId;
            if (assetId == null || assetId.length === 0) {
              throw new Error(`CMS tour ${document.id}: bento slot is empty`);
            }
            const asset = assets.get(assetId);
            if (asset == null) {
              throw new Error(
                `CMS tour ${document.id}: bento slot references missing asset "${assetId}"`
              );
            }
            return {
              src: gridSrc(asset),
              alt: asset.alt || undefined,
              ...(slot.objectPosition != null ? { objectPosition: slot.objectPosition } : {}),
            };
          }),
        })),
      }
    : undefined;

  const reservedIds = new Set(
    [document.coverAssetId, document.prefaceAssetId].filter(
      (id): id is string => id != null && id.length > 0
    )
  );
  const poolAssets = document.assets.filter((asset) => !reservedIds.has(asset.id));

  const bentoStills =
    bentoLayout?.blocks.flatMap((block, blockIndex) =>
      block.slots.map((slot, slotIndex) => {
        const assetId = completeBlocks[blockIndex]?.slots[slotIndex]?.assetId;
        const asset = assetId != null ? assets.get(assetId) : undefined;
        return asset?.stillUrl ?? slot.src;
      })
    ) ?? [];
  const bentoGrid =
    bentoLayout?.blocks.flatMap((block) => block.slots.map((slot) => slot.src)) ?? [];

  const restStills = hasBento ? bentoStills : poolAssets.map((asset) => asset.stillUrl);
  const restGrid = hasBento ? bentoGrid : poolAssets.map((asset) => gridSrc(asset));

  const galleryImages = [
    cover.stillUrl,
    ...(preface != null ? [preface.stillUrl] : []),
    ...restStills,
  ];
  const galleryGridUrls = [
    gridSrc(cover),
    ...(preface != null ? [gridSrc(preface)] : []),
    ...restGrid,
  ];

  return {
    id: document.id,
    slug: document.slug,
    season: document.season,
    title: document.title,
    subtitle: document.subtitle,
    heroPhrase: document.heroPhrase,
    duration: document.duration,
    difficulty: document.difficulty,
    ...(document.difficultyDisplayLabel != null
      ? { difficultyDisplayLabel: document.difficultyDisplayLabel }
      : {}),
    ...(document.metaAudienceLabel != null
      ? { metaAudienceLabel: document.metaAudienceLabel }
      : {}),
    price: document.price,
    ...(document.pricePrevious != null ? { pricePrevious: document.pricePrevious } : {}),
    ...(document.priceFootnote != null ? { priceFootnote: document.priceFootnote } : {}),
    description: document.description,
    ...(document.descriptionLeadBold != null
      ? { descriptionLeadBold: document.descriptionLeadBold }
      : {}),
    ...(document.descriptionAside != null ? { descriptionAside: document.descriptionAside } : {}),
    ...(document.seoDescription != null ? { seoDescription: document.seoDescription } : {}),
    ...(document.contentSourceTourId != null
      ? { contentSourceTourId: document.contentSourceTourId }
      : {}),
    program: document.program,
    ...(document.programAdditionalNotes != null
      ? { programAdditionalNotes: document.programAdditionalNotes }
      : {}),
    includedInPrice: document.included.map((item) => ({
      text: item.text,
      icon: resolveIncludedIcon(item.iconKey),
    })),
    imageUrl: cover.stillUrl,
    ...(preface != null ? { prefaceBackgroundImageUrl: preface.stillUrl } : {}),
    galleryImages,
    galleryGridUrls,
    ...(bentoLayout != null ? { bentoLayout } : {}),
    ...(document.coverCrop != null ? { coverCrop: document.coverCrop } : {}),
  };
}

export function resolveTourWithCmsOverlay(
  codeTour: Tour | undefined,
  overlayById: ReadonlyMap<string, Tour>
): Tour | undefined {
  if (codeTour == null) {
    return undefined;
  }
  return overlayById.get(codeTour.id) ?? codeTour;
}
