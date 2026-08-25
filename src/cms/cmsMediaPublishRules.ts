import type { CmsTourDocument } from './cmsTourDocument';
import { isIncludedIconKey } from './includedIconCatalog';

export const CMS_MEDIA_PUBLISH_BLOCKERS = [
  'cover_required',
  'bento_empty_slots',
  'included_icon_required',
] as const;
export type CmsMediaPublishBlocker = (typeof CMS_MEDIA_PUBLISH_BLOCKERS)[number];

export function hasEmptyBentoSlots(document: CmsTourDocument): boolean {
  return document.bento.blocks.some((block) =>
    block.slots.some((slot) => slot.assetId == null || slot.assetId.length === 0),
  );
}

/**
 * Медиа-правила: обложка, заполненная сетка, иконки у пунктов с текстом.
 * Фон «О поездке» и свободные кадры в пуле не блокеры. Completeness (`tour_not_ready`) сюда не входит.
 */
export function cmsMediaPublishBlockers(document: CmsTourDocument): CmsMediaPublishBlocker[] {
  const blockers: CmsMediaPublishBlocker[] = [];
  if (document.coverAssetId == null || document.coverAssetId.length === 0) {
    blockers.push('cover_required');
  }
  if (document.bento.blocks.length === 0 || hasEmptyBentoSlots(document)) {
    blockers.push('bento_empty_slots');
  }
  if (
    document.included.some(
      (item) => item.text.trim().length > 0 && !isIncludedIconKey(item.iconKey),
    )
  ) {
    blockers.push('included_icon_required');
  }
  return blockers;
}
