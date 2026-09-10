import { describe, expect, it } from 'vitest';
import {
  siteContentDraftKey,
  siteContentDraftMetaKey,
  siteContentPublishedKey,
} from './siteContentPackageKeys';

describe('site content package keys', () => {
  it.each(['team', 'contacts', 'footer'] as const)('builds independent keys for %s', kind => {
    expect(siteContentDraftKey(kind)).toBe(`draft/site-content/${kind}/document.json`);
    expect(siteContentDraftMetaKey(kind)).toBe(`draft/site-content/${kind}/meta.json`);
    expect(siteContentPublishedKey(kind)).toBe(`published/site-content/${kind}/document.json`);
  });
});
