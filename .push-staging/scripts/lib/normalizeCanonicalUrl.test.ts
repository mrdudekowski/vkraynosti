import { describe, expect, it } from 'vitest';
import { buildCanonicalUrl, normalizeCanonicalPath } from './normalizeCanonicalUrl.ts';

describe('normalizeCanonicalPath', () => {
  it('adds trailing slash to tour paths', () => {
    expect(normalizeCanonicalPath('/tours/summer/summer-10')).toBe('/tours/summer/summer-10/');
  });

  it('keeps trailing slash when present', () => {
    expect(normalizeCanonicalPath('/tours/summer/summer-10/')).toBe('/tours/summer/summer-10/');
  });

  it('strips query parameters', () => {
    expect(normalizeCanonicalPath('/tours/summer/summer-10/?ogtest=123')).toBe(
      '/tours/summer/summer-10/',
    );
  });

  it('keeps root as slash only', () => {
    expect(normalizeCanonicalPath('/')).toBe('/');
  });

  it('collapses duplicate slashes', () => {
    expect(normalizeCanonicalPath('//tours//summer//summer-10')).toBe('/tours/summer/summer-10/');
  });
});

describe('buildCanonicalUrl', () => {
  it('builds absolute URL with trailing slash', () => {
    expect(buildCanonicalUrl('https://example.com', '/tours/summer/summer-10')).toBe(
      'https://example.com/tours/summer/summer-10/',
    );
  });

  it('builds root URL', () => {
    expect(buildCanonicalUrl('https://example.com/', '/')).toBe('https://example.com/');
  });
});
