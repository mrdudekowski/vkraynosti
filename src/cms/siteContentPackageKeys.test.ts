import { describe, expect, it } from 'vitest';
import {
  siteContentMediaObjectKey,
  siteContentMediaPrefix,
} from './siteContentPackageKeys';

describe('siteContentMediaPrefix', () => {
  it('keeps kind and asset id as separate path segments', () => {
    expect(siteContentMediaPrefix('team')).toBe('media/site-content/team/');
  });
});

describe('siteContentMediaObjectKey', () => {
  it('stores team photos under media/site-content/team/{id}.{ext}', () => {
    expect(siteContentMediaObjectKey('team', '1ffaa643-b261-4cd1-aae1-4398c317298b', 'jpg')).toBe(
      'media/site-content/team/1ffaa643-b261-4cd1-aae1-4398c317298b.jpg',
    );
  });
});
