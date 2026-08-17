import { unusedBentoPoolAssets } from './bentoPoolAssets';
import { isIncludedIconKey } from './includedIconCatalog';
import type { CmsTourDocument } from './cmsTourDocument';

export const CMS_PUBLISH_BLOCKERS = [
  'cover_required',
  'pool_not_empty',
  'bento_empty_slots',
  'included_icon_required',
] as const;
export type CmsPublishBlocker = (typeof CMS_PUBLISH_BLOCKERS)[number];

export function hasEmptyBentoSlots(document: CmsTourDocument): boolean {
  return document.bento.blocks.some((block) =>
    block.slots.some((slot) => slot.assetId == null || slot.assetId.length === 0),
  );
}

/**
 * Правила «Опубликовать»: обложка, заполненная сетка, пустой пул, иконки у пунктов с текстом.
 * Фон «О поездке» не блокер.
 */
export function cmsPublishBlockers(document: CmsTourDocument): CmsPublishBlocker[] {
  const blockers: CmsPublishBlocker[] = [];
  if (document.coverAssetId == null || document.coverAssetId.length === 0) {
    blockers.push('cover_required');
  }
  if (hasEmptyBentoSlots(document)) {
    blockers.push('bento_empty_slots');
  }
  if (unusedBentoPoolAssets(document).length > 0) {
    blockers.push('pool_not_empty');
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
