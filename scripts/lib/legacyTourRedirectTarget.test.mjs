import { describe, expect, it } from 'vitest';
import { resolveLegacyTourRedirectTarget } from './legacyTourRedirectTarget.mjs';

describe('resolveLegacyTourRedirectTarget', () => {
  it('uses the published CMS slug for the same tour id', () => {
    const legacyTour = { id: 'spring-17', season: 'spring', slug: 'old-code-slug', title: 'Old title' };
    const cmsTour = { id: 'spring-17', season: 'spring', slug: 'cms-slug', title: 'Current title', status: 'active' };

    expect(resolveLegacyTourRedirectTarget(legacyTour, [cmsTour])).toBe(cmsTour);
  });

  it('keeps the existing target when the tour has no published CMS route', () => {
    const legacyTour = { id: 'spring-17', season: 'spring', slug: 'legacy-slug' };

    expect(resolveLegacyTourRedirectTarget(legacyTour, [])).toBe(legacyTour);
  });
});
