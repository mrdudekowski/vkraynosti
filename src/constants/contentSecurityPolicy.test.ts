import { describe, expect, it } from 'vitest';
import {
  buildContentSecurityPolicy,
  parseMediaOriginFromAssetBaseUrl,
} from './contentSecurityPolicy';

describe('parseMediaOriginFromAssetBaseUrl', () => {
  it('returns origin for https CDN base URL', () => {
    expect(parseMediaOriginFromAssetBaseUrl('https://cdn.example.com/')).toBe(
      'https://cdn.example.com'
    );
  });

  it('returns null for empty or non-https URL', () => {
    expect(parseMediaOriginFromAssetBaseUrl('')).toBeNull();
    expect(parseMediaOriginFromAssetBaseUrl('http://cdn.example.com/')).toBeNull();
    expect(parseMediaOriginFromAssetBaseUrl('not-a-url')).toBeNull();
  });
});

describe('buildContentSecurityPolicy', () => {
  it('includes Metrika and GAS without extra media origins', () => {
    const csp = buildContentSecurityPolicy();
    expect(csp).toContain("img-src 'self' data: https://placehold.co https://mc.yandex.ru");
    expect(csp).toContain("media-src 'self' blob:");
    expect(csp).toContain('https://mc.yandex.ru');
    expect(csp).toContain('https://script.google.com');
    expect(csp).not.toContain('cdn.example.com');
  });

  it('adds CDN origin to img-src, media-src, and connect-src once', () => {
    const csp = buildContentSecurityPolicy([
      'https://cdn.example.com',
      'https://cdn.example.com',
    ]);
    expect(csp).toContain('img-src');
    expect(csp).toMatch(/img-src[^;]*https:\/\/cdn\.example\.com/);
    expect(csp).toMatch(/media-src[^;]*https:\/\/cdn\.example\.com/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/cdn\.example\.com/);
    const matches = csp.match(/https:\/\/cdn\.example\.com/g);
    expect(matches?.length).toBe(3);
  });
});
