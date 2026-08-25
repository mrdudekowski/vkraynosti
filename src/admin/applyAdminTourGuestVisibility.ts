import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { adminGetTour, adminSaveTour, adminSubmitPublishQueue } from './api';
import { layoutFromDocument, patchFromDocument } from './patchFromDocument';

export type AdminTourGuestVisibilityStatus = Extract<CmsTourDocument['status'], 'active' | 'hidden'>;
export type AdminTourGuestVisibilityResult = 'queued';

export async function applyAdminTourGuestVisibility(
  tourId: string,
  status: AdminTourGuestVisibilityStatus,
): Promise<AdminTourGuestVisibilityResult> {
  const current = await adminGetTour(tourId);
  await adminSaveTour(
    tourId,
    current.meta.rev,
    patchFromDocument(current.document),
    layoutFromDocument(current.document),
    status,
  );
  await adminSubmitPublishQueue({ tourIds: [tourId] });
  return 'queued';
}
