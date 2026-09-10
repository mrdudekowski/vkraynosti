import type { Tour } from '../types';
import { buildCanonicalUrl, normalizeCanonicalPath } from './canonicalUrl';
import { SITE_URL } from './contacts';

/** Minimal tour fields required to build public or legacy URLs. */
export type TourUrlSource = Pick<Tour, 'id' | 'season' | 'slug'>;

/** Latin lowercase slug: words separated by single hyphens. */
export const TOUR_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidTourSlug(slug: string): boolean {
  return TOUR_SLUG_PATTERN.test(slug);
}

/** Public URL segment: explicit slug when set, otherwise stable tour id. */
export function resolveTourPublicUrlSegment(tour: TourUrlSource): string {
  const slug = tour.slug?.trim();
  return slug != null && slug.length > 0 ? slug : tour.id;
}

export function tourHasPublicSlug(tour: TourUrlSource): boolean {
  return Boolean(tour.slug?.trim());
}

export function getTourPublicPath(tour: TourUrlSource): string {
  return normalizeCanonicalPath(
    `/tours/${tour.season}/${resolveTourPublicUrlSegment(tour)}`,
  );
}

export function getLegacyTourPath(tour: TourUrlSource): string {
  return normalizeCanonicalPath(`/tours/${tour.season}/${tour.id}`);
}

export function getTourCanonicalUrl(tour: TourUrlSource): string {
  return buildCanonicalUrl(SITE_URL, getTourPublicPath(tour));
}

/** True when the URL segment is the legacy id and the tour has a dedicated public slug. */
export function isLegacyTourUrlSegment(tour: TourUrlSource, segment: string): boolean {
  return segment === tour.id && tourHasPublicSlug(tour);
}

export function shouldRedirectLegacyTourUrl(tour: TourUrlSource, segment: string): boolean {
  return isLegacyTourUrlSegment(tour, segment);
}

export interface TourSlugValidationIssue {
  message: string;
}

export function collectTourSlugValidationIssues(
  tours: readonly TourUrlSource[],
): TourSlugValidationIssue[] {
  const issues: TourSlugValidationIssue[] = [];
  const slugOwners = new Map<string, string[]>();
  const slugLowerOwners = new Map<string, string[]>();
  const allIds = new Set(tours.map((tour) => tour.id));

  for (const tour of tours) {
    const slug = tour.slug?.trim();
    if (slug == null || slug.length === 0) {
      continue;
    }

    if (/[\u0400-\u04FF]/.test(slug)) {
      issues.push({ message: `Tour ${tour.id}: slug contains Cyrillic: "${slug}"` });
    }
    if (/\s/.test(slug)) {
      issues.push({ message: `Tour ${tour.id}: slug contains whitespace: "${slug}"` });
    }
    if (slug.includes('/') || slug.includes('?') || slug.includes('_')) {
      issues.push({ message: `Tour ${tour.id}: slug contains forbidden characters: "${slug}"` });
    }
    if (!isValidTourSlug(slug)) {
      issues.push({ message: `Tour ${tour.id}: invalid slug format: "${slug}"` });
    }
    if (allIds.has(slug) && slug !== tour.id) {
      issues.push({
        message: `Tour ${tour.id}: slug "${slug}" matches another tour id`,
      });
    }

    const owners = slugOwners.get(slug) ?? [];
    owners.push(tour.id);
    slugOwners.set(slug, owners);

    const lowerKey = slug.toLowerCase();
    const lowerOwners = slugLowerOwners.get(lowerKey) ?? [];
    lowerOwners.push(tour.id);
    slugLowerOwners.set(lowerKey, lowerOwners);
  }

  for (const [slug, owners] of slugOwners) {
    if (owners.length > 1) {
      issues.push({
        message: `Duplicate tour slug: "${slug}" used by ${owners.join(' and ')}`,
      });
    }
  }

  for (const [lowerKey, owners] of slugLowerOwners) {
    const distinctSlugs = new Set(
      owners.map((id) => tours.find((t) => t.id === id)?.slug?.trim()).filter(Boolean),
    );
    if (distinctSlugs.size > 1) {
      issues.push({
        message: `Tour slugs differ only by case: ${[...distinctSlugs].join(', ')} (${owners.join(', ')})`,
      });
    }
    if (distinctSlugs.size === 1 && lowerKey !== [...distinctSlugs][0]) {
      issues.push({
        message: `Tour slug case mismatch for "${lowerKey}" (${owners.join(', ')})`,
      });
    }
  }

  return issues;
}

export function validateTourSlugs(tours: readonly TourUrlSource[]): void {
  const issues = collectTourSlugValidationIssues(tours);
  if (issues.length > 0) {
    throw new Error(issues.map((issue) => issue.message).join('\n'));
  }
}
