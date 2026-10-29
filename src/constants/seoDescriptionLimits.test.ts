import { describe, expect, it } from 'vitest';
import { TOURS } from '../data/toursData';
import { TOUR_SEO_DESCRIPTION_BY_ID } from '../data/tourSeoDescriptions';
import { META_DESCRIPTION_MAX_LENGTH, isNormalizedMetaContent } from './metaContent';
import { ROUTES } from './routes';
import {
  SEO_DEFAULTS,
  getSeasonSeoEntry,
  getTourSeoEntry,
} from './seo';
import type { Season } from '../types';

const assertDescriptionLimit = (label: string, description: string): void => {
  expect(description.length, `${label} length`).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
  expect(isNormalizedMetaContent(description), `${label} normalized`).toBe(true);
  expect(description.endsWith('…'), `${label} should not be truncated`).toBe(false);
};

describe('static SEO descriptions', () => {
  it('home, safety and privacy stay within CMS-supported 180 chars', () => {
    assertDescriptionLimit('home', SEO_DEFAULTS.home.description);
    assertDescriptionLimit('safety', SEO_DEFAULTS.safety.description);
    assertDescriptionLimit('privacy', SEO_DEFAULTS.privacy.description);
  });

  it('season list pages stay within CMS-supported 180 chars', () => {
    (['winter', 'spring', 'summer', 'fall'] as Season[]).forEach(season => {
      const entry = getSeasonSeoEntry(season, `/tours/${season}`);
      assertDescriptionLimit(`season:${season}`, entry.description);
    });
  });
});

describe('tour SEO descriptions', () => {
  it('all tours stay within CMS-supported 180 chars without truncation', () => {
    for (const tour of TOURS) {
      const entry = getTourSeoEntry(tour);
      assertDescriptionLimit(tour.id, entry.description);
    }
  });

  it('in_development tours stay within CMS-supported 180 chars without truncation', () => {
    for (const tour of TOURS) {
      const entry = getTourSeoEntry(tour, { publicationStatus: 'in_development' });
      assertDescriptionLimit(`in_development:${tour.id}`, entry.description);
      expect(entry.description).not.toBe('В разработке');
    }
  });

  it('manual overrides stay within CMS-supported 180 chars', () => {
    for (const [id, description] of Object.entries(TOUR_SEO_DESCRIPTION_BY_ID)) {
      assertDescriptionLimit(`override:${id}`, description);
    }
  });
});

describe('SEO_DEFAULTS paths', () => {
  it('keeps canonical paths for static pages', () => {
    expect(SEO_DEFAULTS.home.path).toBe(ROUTES.HOME);
    expect(SEO_DEFAULTS.safety.path).toBe(ROUTES.SAFETY);
    expect(SEO_DEFAULTS.privacy.path).toBe(ROUTES.PRIVACY);
  });

  it('makes the approved Safety page indexable and keeps Privacy noindex', () => {
    expect(SEO_DEFAULTS.safety.robots).toBe('index,follow');
    expect(SEO_DEFAULTS.privacy.robots).toBe('noindex,nofollow');
  });

  it('keeps the safety snippet in the search result band', () => {
    expect(SEO_DEFAULTS.safety.title.length).toBeGreaterThanOrEqual(50);
    expect(SEO_DEFAULTS.safety.title.length).toBeLessThanOrEqual(60);
    expect(SEO_DEFAULTS.safety.description.length).toBeGreaterThanOrEqual(150);
    expect(SEO_DEFAULTS.safety.description.length).toBeLessThanOrEqual(160);
  });
});
