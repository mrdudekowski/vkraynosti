import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getCanonicalUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('adds trailing slash for tour pages', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://example.com');
    vi.resetModules();
    const { getCanonicalUrl } = await import('./seo');
    expect(getCanonicalUrl('/tours/summer/summer-10')).toBe(
      'https://example.com/tours/summer/summer-10/',
    );
  });

  it('keeps root canonical URL', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://example.com');
    vi.resetModules();
    const { getCanonicalUrl } = await import('./seo');
    expect(getCanonicalUrl('/')).toBe('https://example.com/');
  });
});

describe('season collection schema', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('describes a season catalog as a CollectionPage', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://vkraynosti.ru');
    vi.resetModules();
    const { getSeasonCollectionSchema } = await import('./seo');
    expect(getSeasonCollectionSchema('summer', '/tours/summer')).toMatchObject({
      '@type': 'CollectionPage',
      name: 'Лето',
      url: 'https://vkraynosti.ru/tours/summer/',
      inLanguage: 'ru-RU',
    });
  });
});

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

  it('drops the bake prefix so a CDN key stays media/tours', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://prod.example.com');
    vi.stubEnv('VITE_BASE_PATH', '/');
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    vi.resetModules();
    const { getAbsoluteOgImageUrl } = await import('./seo');
    expect(getAbsoluteOgImageUrl('/data/cms/media/tours/fall-1/cover.webp')).toBe(
      'https://cdn.example.com/media/tours/fall-1/cover.webp',
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

describe('CMS tour SEO fields', () => {
  it('prefers CMS title, description, H1, and curated keyword phrases', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://vkraynosti.ru');
    vi.resetModules();
    const [{ getTourSeoEntry, getTourStructuredData }, { getRuntimeTourById }] = await Promise.all([
      import('./seo'),
      import('../data/runtimeCatalog'),
    ]);
    const base = getRuntimeTourById('summer-10');
    if (!base) throw new Error('summer-10 missing');
    const tour = { ...base, seo: {
      title: 'Тестовый title тура', description: 'Тестовое описание маршрута.',
      h1: 'Тестовый H1 тура', keywords: ['туры по Приморью', 'бухта Краббе'],
    } };
    expect(getTourSeoEntry(tour)).toMatchObject({
      title: 'Тестовый title тура', description: 'Тестовое описание маршрута.',
      h1: 'Тестовый H1 тура', keywords: ['туры по Приморью', 'бухта Краббе'],
    });
    expect(getTourStructuredData(tour).name).toBe('Тестовый H1 тура');
  });
});
