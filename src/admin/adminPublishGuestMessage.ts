import { ADMIN_UI } from './constants/ui';

export function adminPublishGuestMessage(
  catalogMirror: 'up' | 'down' | undefined,
): string {
  return catalogMirror === 'up' ? ADMIN_UI.publishedLive : ADMIN_UI.publishedAfterDeploy;
}
