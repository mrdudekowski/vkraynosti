import {
  CMS_MEDIA_PUBLISH_BLOCKERS,
  cmsMediaPublishBlockers,
} from './cmsMediaPublishRules';
import type { CmsTourDocument } from './cmsTourDocument';
import { isTourReady } from './tourCompleteness';

export {
  CMS_MEDIA_PUBLISH_BLOCKERS,
  cmsMediaPublishBlockers,
  hasEmptyBentoSlots,
} from './cmsMediaPublishRules';

export const CMS_PUBLISH_BLOCKERS = [...CMS_MEDIA_PUBLISH_BLOCKERS, 'tour_not_ready'] as const;
export type CmsPublishBlocker = (typeof CMS_PUBLISH_BLOCKERS)[number];

/**
 * Правила «Опубликовать»: медиа-галерея и заполненность всех пяти разделов.
 */
export function cmsPublishBlockers(document: CmsTourDocument): CmsPublishBlocker[] {
  const blockers: CmsPublishBlocker[] = cmsMediaPublishBlockers(document);
  if (!isTourReady(document)) {
    blockers.push('tour_not_ready');
  }
  return blockers;
}

/**
 * Скрытие уже опубликованного тура — смена видимости, а не выпуск карточки.
 * Неполное заполнение не должно оставлять тур на сайте.
 */
export function cmsPublishBlockersForIntent(
  document: CmsTourDocument,
  options: { hasPublishedSnapshot: boolean },
): CmsPublishBlocker[] {
  if (document.status === 'hidden' && options.hasPublishedSnapshot) {
    return [];
  }
  return cmsPublishBlockers(document);
}
