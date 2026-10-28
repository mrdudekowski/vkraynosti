import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { getTourCanonicalUrl, type TourUrlSource } from '../constants/tourUrls';
import { adminTourLiveVisibility } from './tourLiveVisibility';

export function adminTourPublicHref(tour: TourUrlSource): string {
  return getTourCanonicalUrl(tour);
}

export function adminTourHasPublicPage(tour: {
  status: CmsTourDocument['status'];
  published: boolean;
  publishedStatus?: CmsTourDocument['status'] | null;
}): boolean {
  const live = adminTourLiveVisibility(tour);
  return live === 'on_site' || live === 'will_hide';
}
