import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { AdminBadgeTone } from './components/AdminBadge';
import { adminTourLiveVisibility, countToursLiveOnSite } from './tourLiveVisibility';

export const ADMIN_TOUR_VISIBILITY = [
  'all',
  'on_site',
  'in_development',
  'hidden',
  'draft',
] as const;
export type AdminTourVisibilityFilter = (typeof ADMIN_TOUR_VISIBILITY)[number];
export type AdminTourVisibility = Exclude<AdminTourVisibilityFilter, 'all'>;

export function adminTourVisibility(tour: {
  status: CmsTourDocument['status'];
  published: boolean;
}): AdminTourVisibility {
  if (!tour.published) {
    return 'draft';
  }
  if (tour.status === 'active') {
    return 'on_site';
  }
  if (tour.status === 'hidden') {
    return 'hidden';
  }
  return 'in_development';
}

export function adminTourGuestVisibilityAction(
  tour: {
    status: CmsTourDocument['status'];
    published: boolean;
  },
): 'hide' | 'show' | null {
  const visibility = adminTourVisibility(tour);
  if (visibility === 'on_site') {
    return 'hide';
  }
  if (visibility === 'hidden') {
    return 'show';
  }
  return null;
}

export function adminTourVisibilityTone(visibility: AdminTourVisibility): AdminBadgeTone {
  if (visibility === 'on_site') {
    return 'success';
  }
  if (visibility === 'in_development') {
    return 'warning';
  }
  if (visibility === 'hidden') {
    return 'info';
  }
  return 'draft';
}

export function matchesAdminTourVisibility(
  tour: {
    status: CmsTourDocument['status'];
    published: boolean;
    publishedStatus?: CmsTourDocument['status'] | null;
    title: string;
  },
  filter: AdminTourVisibilityFilter,
  query: string,
): boolean {
  const live = adminTourLiveVisibility(tour);
  const visibility: AdminTourVisibility =
    live === 'draft'
      ? 'draft'
      : live === 'on_site' || live === 'will_hide'
        ? 'on_site'
        : live === 'hidden' || live === 'will_show'
          ? 'hidden'
          : 'in_development';
  if (filter !== 'all' && visibility !== filter) {
    return false;
  }
  const needle = query.trim().toLocaleLowerCase('ru-RU');
  if (needle.length === 0) {
    return true;
  }
  return tour.title.toLocaleLowerCase('ru-RU').includes(needle);
}

export function countToursOnSite(
  tours: Array<{
    status: CmsTourDocument['status'];
    published: boolean;
    publishedStatus?: CmsTourDocument['status'] | null;
  }>,
): { onSite: number; total: number } {
  return countToursLiveOnSite(tours);
}
