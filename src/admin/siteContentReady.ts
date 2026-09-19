import type { SiteContentDocument } from '../cms/siteContentDocument';
import { ADMIN_UI } from './constants/ui';

const hasPhoto = (url: string) => url.trim().length > 0;
const hasPdfFile = (url: string | undefined) => (url ?? '').trim().length > 0;

export function siteContentBlocker(document: SiteContentDocument): string | null {
  if (document.kind === 'team') {
    if (document.members.some((member) => !hasPhoto(member.photo.url))) {
      return ADMIN_UI.sitePhotoRequired;
    }
    if (document.members.some((member) => member.name.trim().length === 0)) {
      return ADMIN_UI.siteDraftInvalid;
    }
    return null;
  }

  if (document.kind === 'footer') {
    const missingPdf = document.blocks.some((block) =>
      block.rows.some((row) => row.type === 'pdf' && !hasPdfFile(row.asset?.url)),
    );
    return missingPdf ? ADMIN_UI.sitePdfRequired : null;
  }

  if (document.kind === 'contacts') {
    const incomplete = document.channels.some(
      (channel) => channel.label.trim().length === 0 || channel.href.trim().length === 0,
    );
    return incomplete ? ADMIN_UI.siteDraftInvalid : null;
  }

  if (document.contactTitle.trim().length === 0 || document.tourContactTitle.trim().length === 0) {
    return ADMIN_UI.siteDraftInvalid;
  }
  return null;
}
