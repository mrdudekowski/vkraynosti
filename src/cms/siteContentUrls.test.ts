import { describe, expect, it } from 'vitest';
import { buildSiteContentPublishedUrl, resolveSiteContentLocalFallbackUrl } from './siteContentUrls';

describe('site content urls', () => {
  it('builds published and local fallback urls per kind', () => {
    expect(buildSiteContentPublishedUrl('https://cdn.test/', 'team')).toBe('https://cdn.test/published/site-content/team/document.json');
    expect(resolveSiteContentLocalFallbackUrl('footer')).toBe('/data/cms/site-content/footer.json');
  });
});
