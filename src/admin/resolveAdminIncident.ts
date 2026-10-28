import type { AdminCmsHealth } from './api';

export type AdminIncident = 'api_down' | 'catalog_down' | 'media_down';

export function resolveAdminIncident(
  health: AdminCmsHealth | null,
  fetchFailed: boolean,
): AdminIncident | null {
  if (fetchFailed) return 'api_down';
  if (health == null) return null;
  if (health.postgres === 'down' || health.jsonStore === 'down') return 'catalog_down';
  if (
    health.storage === 'open' ||
    health.storage === 'half-open' ||
    health.catalogMirror === 'down'
  ) {
    return 'media_down';
  }
  return null;
}
