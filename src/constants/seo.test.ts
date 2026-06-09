import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getAbsoluteOgImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns https URLs unchanged', async () => {
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', '');
    vi.resetModules();
    const { getAbsoluteOgImageUrl } = await import('./seo');
    expect(getAbsoluteOgImageUrl('https://cdn.example.com/tours/summer-1/first.webp')).toBe(
      'https://cdn.example.com/tours/summer-1/first.webp',
    );
  });

  it('prefixes SITE_URL for app-relative tour paths without doubling base', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://example.com/vkraynosti');
    vi.stubEnv('VITE_BASE_PATH', '/vkraynosti/');
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', '');
    vi.resetModules();
    const { getAbsoluteOgImageUrl } = await import('./seo');
    expect(getAbsoluteOgImageUrl('/vkraynosti/tours/summer-1/first.webp')).toBe(
      'https://example.com/vkraynosti/tours/summer-1/first.webp',
    );
    expect(getAbsoluteOgImageUrl('/vkraynosti/banners_summer/Summer.webp')).toBe(
      'https://example.com/vkraynosti/banners_summer/Summer.webp',
    );
  });

  it('uses CDN origin when VITE_PUBLIC_ASSET_BASE_URL is set', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://prod.example.com');
    vi.stubEnv('VITE_BASE_PATH', '/');
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    vi.resetModules();
    const { getAbsoluteOgImageUrl } = await import('./seo');
    expect(getAbsoluteOgImageUrl('/tours/summer-1/first.webp')).toBe(
      'https://cdn.example.com/tours/summer-1/first.webp',
    );
  });
});

describe('getOgShellAbsoluteImageUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses App origin even when CDN env is set', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://app.example.com');
    vi.stubEnv('VITE_BASE_PATH', '/');
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    vi.resetModules();
    const { getOgShellAbsoluteImageUrl } = await import('./seo');
    expect(getOgShellAbsoluteImageUrl('/tours/summer-1/cover.webp')).toBe(
      'https://app.example.com/tours/summer-1/cover.webp',
    );
    expect(getOgShellAbsoluteImageUrl('https://cdn.example.com/tours/summer-1/cover.webp')).toBe(
      'https://app.example.com/tours/summer-1/cover.webp',
    );
  });
});

describe('SEO_DEFAULTS.defaultOgImage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is an absolute https URL', async () => {
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', '');
    vi.resetModules();
    const { SEO_DEFAULTS } = await import('./seo');
    expect(SEO_DEFAULTS.defaultOgImage).toMatch(/^https:\/\//);
  });
});
