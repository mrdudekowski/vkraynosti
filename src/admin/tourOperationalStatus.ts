import type { AdminTourListItem } from './api';

export type AdminTourOperationalStatus = 'on_site' | 'hidden' | 'ready' | 'blocked';

export function adminTourOperationalStatus(tour: Pick<AdminTourListItem, 'status' | 'published' | 'publishedStatus' | 'ready'>): AdminTourOperationalStatus {
  const liveStatus = tour.publishedStatus ?? tour.status;
  if (tour.published && liveStatus === 'active') return 'on_site';
  if (liveStatus === 'hidden') return 'hidden';
  return tour.ready ? 'ready' : 'blocked';
}
