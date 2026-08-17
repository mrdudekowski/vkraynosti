import type { CmsTourDocument } from '../cms/cmsTourDocument';

export const ADMIN_TOUR_VISIBILITY = ['all', 'on_site', 'hidden'] as const;
export type AdminTourVisibilityFilter = (typeof ADMIN_TOUR_VISIBILITY)[number];
export type AdminTourVisibility = 'on_site' | 'hidden';

export function adminTourVisibility(tour: {
  status: CmsTourDocument['status'];
  published: boolean;
}): AdminTourVisibility {
  return tour.published && tour.status !== 'hidden' ? 'on_site' : 'hidden';
}

export function matchesAdminTourVisibility(
  tour: { status: CmsTourDocument['status']; published: boolean; title: string },
  filter: AdminTourVisibilityFilter,
  query: string,
): boolean {
  const visibility = adminTourVisibility(tour);
  if (filter !== 'all' && visibility !== filter) {
    return false;
  }
  const needle = query.trim().toLocaleLowerCase('ru-RU');
  if (needle.length === 0) {
    return true;
  }
  return tour.title.toLocaleLowerCase('ru-RU').includes(needle);
}
