import type { CmsTourDocument } from '../cms/cmsTourDocument';
import type { AdminBadgeTone } from './components/AdminBadge';

export type AdminTourLiveVisibilityKind =
  | 'draft'
  | 'on_site'
  | 'will_hide'
  | 'hidden'
  | 'will_show'
  | 'in_development';

export type AdminTourLiveVisibilityInput = {
  status: CmsTourDocument['status'];
  published: boolean;
  publishedStatus?: CmsTourDocument['status'] | null;
};

export function adminTourLiveVisibility(tour: AdminTourLiveVisibilityInput): AdminTourLiveVisibilityKind {
  if (!tour.published) {
    return 'draft';
  }
  const live = tour.publishedStatus ?? tour.status;
  if (tour.status === 'hidden' && live !== 'hidden') {
    return 'will_hide';
  }
  if (tour.status === 'active' && live === 'hidden') {
    return 'will_show';
  }
  if (tour.status === 'hidden' || live === 'hidden') {
    return 'hidden';
  }
  if (tour.status === 'active' && live === 'active') {
    return 'on_site';
  }
  return 'in_development';
}

export function adminTourLiveVisibilityTone(kind: AdminTourLiveVisibilityKind): AdminBadgeTone {
  if (kind === 'on_site') {
    return 'success';
  }
  if (kind === 'will_hide' || kind === 'will_show' || kind === 'in_development') {
    return 'warning';
  }
  if (kind === 'hidden') {
    return 'info';
  }
  return 'draft';
}

export function countToursLiveOnSite(
  tours: AdminTourLiveVisibilityInput[],
): { onSite: number; total: number } {
  return {
    onSite: tours.filter((tour) => {
      if (!tour.published) {
        return false;
      }
      const live = tour.publishedStatus ?? tour.status;
      return live === 'active';
    }).length,
    total: tours.length,
  };
}
