import type { Tour } from '../types';
import { getTourGalleryLayoutVariant } from '../constants/tourGalleryLayoutVariant';
import { persistTourDescriptionColumns } from '../utils/splitTourDescription';
import { resolveTourBentoLayout } from '../utils/tourBento/resolveTourBentoLayout';
import { getTourGalleryGridUrls } from '../utils/tourGalleryUrls';
import { includedIconKey } from './includedIconCatalog';
import { durationDaysFromLabel } from './durationDays';
import type { CmsTourAsset, CmsTourDocument } from './cmsTourDocument';

function fileStemFromUrl(url: string, fallback: string): string {
  try {
    const path = new URL(url, 'https://cms.invalid').pathname;
    const name = path.split('/').filter(Boolean).pop();
    if (name != null && name.length > 0) {
      return name.replace(/\.[^.]+$/, '') || fallback;
    }
  } catch {
    /* relative path */
  }
  const leaf = url.split('/').filter(Boolean).pop();
  return (leaf ?? fallback).replace(/\.[^.]+$/, '') || fallback;
}

function isVideoUrl(url: string): boolean {
  return /\.(webm|mp4)(\?|$)/i.test(url);
}

export function siteTourToCmsDocument(tour: Tour): CmsTourDocument {
  const gridUrls = getTourGalleryGridUrls(tour);
  const stills = tour.galleryImages;
  const coverStill = tour.imageUrl;
  const prefaceStill = tour.prefaceBackgroundImageUrl ?? stills[1];
  const gridForBento = gridUrls.length > 2 ? gridUrls.slice(2) : [];
  const layout = resolveTourBentoLayout(tour, gridForBento);

  const assets: CmsTourAsset[] = [];
  const urlToAssetId = new Map<string, string>();

  const addAsset = (id: string, stillUrl: string, videoUrl: string | null, alt: string) => {
    const existingId =
      urlToAssetId.get(stillUrl) ?? (videoUrl != null ? urlToAssetId.get(videoUrl) : undefined);
    if (existingId != null) {
      const existing = assets.find((asset) => asset.id === existingId);
      if (existing != null && existing.videoUrl == null && videoUrl != null) {
        existing.videoUrl = videoUrl;
        urlToAssetId.set(videoUrl, existingId);
      }
      return existingId;
    }
    assets.push({ id, stillUrl, videoUrl, alt });
    urlToAssetId.set(stillUrl, id);
    if (videoUrl != null) {
      urlToAssetId.set(videoUrl, id);
    }
    return id;
  };

  const coverAssetId = addAsset('cover', coverStill, null, tour.title);
  const prefaceAssetId =
    prefaceStill != null && prefaceStill !== coverStill
      ? addAsset('preface', prefaceStill, null, tour.title)
      : null;

  const galleryCount = Math.max(stills.length, gridUrls.length);
  for (let index = 0; index < galleryCount; index += 1) {
    const stillUrl = stills[index] ?? gridUrls[index];
    const gridUrl = gridUrls[index] ?? stillUrl;
    if (stillUrl == null || gridUrl == null) {
      continue;
    }
    addAsset(
      `g-${index}`,
      stillUrl,
      isVideoUrl(gridUrl) ? gridUrl : null,
      tour.title
    );
  }

  const bentoBlocks = (layout?.blocks ?? []).map((block, blockIndex) => ({
    type: block.type,
    slots: block.slots.map((slot, slotIndex) => {
      const src = slot.src;
      const stillFromGallery =
        stills.find((_, index) => index >= 2 && gridUrls[index] === src) ??
        (isVideoUrl(src) ? stills[gridUrls.indexOf(src)] : src);
      const stillUrl = stillFromGallery && !isVideoUrl(stillFromGallery) ? stillFromGallery : src;
      const videoUrl = isVideoUrl(src) ? src : null;
      const existingId = urlToAssetId.get(src) ?? urlToAssetId.get(stillUrl);
      const assetId =
        existingId ??
        addAsset(`g-${blockIndex}-${slotIndex}`, stillUrl, videoUrl, slot.alt ?? tour.title);
      return {
        assetId,
        ...(slot.objectPosition != null ? { objectPosition: slot.objectPosition } : {}),
      };
    }),
  }));

  const durationDays = durationDaysFromLabel(tour.duration);
  const descriptionColumns = persistTourDescriptionColumns(
    tour.description,
    tour.descriptionAside
  );

  return {
    id: tour.id,
    slug: tour.slug ?? tour.id,
    season: tour.season,
    status: 'active',
    title: tour.title,
    subtitle: tour.subtitle,
    heroPhrase: tour.heroPhrase,
    description: descriptionColumns.description,
    ...(tour.descriptionLeadBold != null
      ? { descriptionLeadBold: tour.descriptionLeadBold }
      : {}),
    ...(descriptionColumns.descriptionAside != null
      ? { descriptionAside: descriptionColumns.descriptionAside }
      : {}),
    duration: tour.duration,
    ...(durationDays != null ? { durationDays } : {}),
    difficulty: tour.difficulty,
    ...(tour.difficultyDisplayLabel != null
      ? { difficultyDisplayLabel: tour.difficultyDisplayLabel }
      : {}),
    ...(tour.metaAudienceLabel != null ? { metaAudienceLabel: tour.metaAudienceLabel } : {}),
    price: tour.price,
    ...(tour.pricePrevious != null ? { pricePrevious: tour.pricePrevious } : {}),
    ...(tour.priceFootnote != null ? { priceFootnote: tour.priceFootnote } : {}),
    program: tour.program,
    ...(tour.programAdditionalNotes != null
      ? { programAdditionalNotes: tour.programAdditionalNotes }
      : {}),
    included: tour.includedInPrice.map((item) => ({
      text: item.text,
      iconKey: includedIconKey(item.icon),
    })),
    ...(tour.seoDescription != null ? { seoDescription: tour.seoDescription } : {}),
    ...(tour.contentSourceTourId != null
      ? { contentSourceTourId: tour.contentSourceTourId }
      : {}),
    coverAssetId,
    prefaceAssetId,
    assets,
    bento: { blocks: bentoBlocks },
    ...(tour.coverCrop != null ? { coverCrop: tour.coverCrop } : {}),
    legacyGalleryVariant: bentoBlocks.length > 0 ? null : getTourGalleryLayoutVariant(tour.id),
  };
}

export function cmsObjectKeyFromPublicUrl(
  publicUrl: string,
  publicBaseUrl: string
): string {
  const base = publicBaseUrl.replace(/\/+$/, '');
  const withoutQuery = publicUrl.split('?')[0] ?? publicUrl;
  if (!withoutQuery.startsWith(`${base}/`)) {
    throw new Error(`CMS asset URL is not under ${base}`);
  }
  return withoutQuery.slice(base.length + 1);
}

export function rewriteCmsDocumentAssetBase(
  document: CmsTourDocument,
  publicBaseUrl: string,
  keyPrefix: string
): CmsTourDocument {
  const base = publicBaseUrl.replace(/\/+$/, '');
  const prefix = keyPrefix.replace(/^\/+|\/+$/g, '');

  const rewrite = (url: string): string => {
    const fileName = fileStemFromUrl(url, 'asset');
    const extMatch = url.match(/(\.[a-z0-9]+)(?:\?|$)/i);
    const ext = extMatch?.[1] ?? '.webp';
    return `${base}/${prefix}/${fileName}${ext}`;
  };

  return {
    ...document,
    assets: document.assets.map((asset) => ({
      ...asset,
      stillUrl: rewrite(asset.stillUrl),
      videoUrl: asset.videoUrl != null ? rewrite(asset.videoUrl) : null,
    })),
  };
}
