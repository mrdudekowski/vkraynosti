import { describe, expect, it } from 'vitest';
import { TOURS } from '../data/toursData';
import { findTourBySeasonAndSegment, getTourBySlug } from '../data/tourLookup';
import {
  collectTourSlugValidationIssues,
  getLegacyTourPath,
  getTourCanonicalUrl,
  getTourPublicPath,
  isLegacyTourUrlSegment,
  shouldRedirectLegacyTourUrl,
  validateTourSlugs,
} from './tourUrls';
import { buildCanonicalUrl } from './canonicalUrl';
import { SITE_URL } from './contacts';
import { getTourLegacyRedirectPaths, getTourPublicSeoPaths } from './tourSeoRoutes';

const summer10 = TOURS.find((tour) => tour.id === 'summer-10');
if (summer10 == null) {
  throw new Error('summer-10 missing from catalog');
}

describe('getTourPublicPath', () => {
  it('returns slug URL for summer-10 pilot', () => {
    expect(getTourPublicPath(summer10)).toBe('/tours/summer/robinzonada-v-rayone-tryokhi/');
  });

  it('falls back to id when slug is absent', () => {
    expect(
      getTourPublicPath({
        id: 'spring-1',
        season: 'spring',
      }),
    ).toBe('/tours/spring/spring-1/');
  });
});

describe('getLegacyTourPath', () => {
  it('keeps id-based legacy path for summer-10', () => {
    expect(getLegacyTourPath(summer10)).toBe('/tours/summer/summer-10/');
  });
});

describe('getTourCanonicalUrl', () => {
  it('builds absolute slug URL from site origin', () => {
    expect(getTourCanonicalUrl(summer10)).toBe(
      buildCanonicalUrl(SITE_URL, getTourPublicPath(summer10)),
    );
  });
});

describe('findTourBySeasonAndSegment', () => {
  it('finds summer-10 by slug', () => {
    const tour = findTourBySeasonAndSegment('summer', 'robinzonada-v-rayone-tryokhi');
    expect(tour?.id).toBe('summer-10');
  });

  it('finds summer-10 by legacy id segment', () => {
    const tour = findTourBySeasonAndSegment('summer', 'summer-10');
    expect(tour?.id).toBe('summer-10');
  });
});

describe('getTourBySlug', () => {
  it('returns summer-10 for pilot slug', () => {
    expect(getTourBySlug('robinzonada-v-rayone-tryokhi')?.id).toBe('summer-10');
  });
});

describe('legacy redirect mapping', () => {
  it('detects legacy id segment when slug exists', () => {
    expect(isLegacyTourUrlSegment(summer10, 'summer-10')).toBe(true);
    expect(shouldRedirectLegacyTourUrl(summer10, 'summer-10')).toBe(true);
    expect(isLegacyTourUrlSegment(summer10, 'robinzonada-v-rayone-tryokhi')).toBe(false);
  });
});

describe('slug validation', () => {
  it('passes for current catalog', () => {
    expect(() => validateTourSlugs(TOURS)).not.toThrow();
    expect(collectTourSlugValidationIssues(TOURS)).toEqual([]);
  });

  it('reports duplicate slugs', () => {
    const issues = collectTourSlugValidationIssues([
      { id: 'summer-10', slug: 'same-slug', season: 'summer' },
      { id: 'summer-11', slug: 'same-slug', season: 'summer' },
    ]);
    expect(issues.some((issue) => issue.message.includes('Duplicate tour slug'))).toBe(true);
  });
});

describe('sitemap and OG-shell route generation', () => {
  it('includes slug path for summer-10 and excludes legacy id from public list', () => {
    const publicPaths = getTourPublicSeoPaths();
    expect(publicPaths).toContain('/tours/summer/robinzonada-v-rayone-tryokhi');
    expect(publicPaths).not.toContain('/tours/summer/summer-10');
    expect(publicPaths).toContain('/tours/spring/spring-1');
  });

  it('lists legacy redirect paths separately', () => {
    expect(getTourLegacyRedirectPaths()).toEqual(['/tours/summer/summer-10']);
  });
});
