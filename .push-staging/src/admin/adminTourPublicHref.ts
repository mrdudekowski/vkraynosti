import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { getTourPublicPath, type TourUrlSource } from '../constants/tourUrls';
import { adminTourLiveVisibility } from './tourLiveVisibility';

export function adminTourPublicHref(
  tour: TourUrlSource,
  baseUrl: string = import.meta.env.BASE_URL,
): string {
  const prefix = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${prefix}${getTourPublicPath(tour)}`;
}

export function adminTourHasPublicPage(tour: {
  status: CmsTourDocument['status'];
  published: boolean;
  publishedStatus?: CmsTourDocument['status'] | null;
}): boolean {
  const live = adminTourLiveVisibility(tour);
  return live === 'on_site' || live === 'will_hide';
}
