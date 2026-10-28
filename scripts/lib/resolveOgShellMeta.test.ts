/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setupOgShellBuildEnv } from './ogShellEnv.ts';

describe('copyOgShellAssets', () => {
  let rootDir = '';
  let distDir = '';

  afterEach(async () => {
    if (rootDir) await rm(rootDir, { recursive: true, force: true });
    if (distDir) await rm(distDir, { recursive: true, force: true });
    rootDir = '';
    distDir = '';
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('copies assets from public when present', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    const logical = 'tours/summer/summer-1/cover.jpg';
    const publicDir = join(rootDir, 'public', 'tours/summer/summer-1');
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, 'cover.jpg'), 'cover-bytes', 'utf8');

    const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
    const resolved = await copyOgShellAssets(distDir, rootDir, [logical]);

    expect(existsSync(join(distDir, logical))).toBe(true);
    expect(resolved.get(logical)).toBe(logical);
  });

  it('fetches from CDN when public file is missing', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    const logical = 'banners_summer/Summer.webp';

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        expect(url).toBe(`https://cdn.example.com/${logical}`);
        return new Response('banner-bytes', { status: 200 });
      }),
    );

    const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
    const resolved = await copyOgShellAssets(distDir, rootDir, [logical]);
    expect(existsSync(join(distDir, logical))).toBe(true);
    expect(resolved.get(logical)).toBe(logical);
  });

  it('uses the public S3 base URL when the asset base alias is absent', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    vi.stubEnv('VITE_PUBLIC_S3_BASE_URL', 'https://cdn.example.com/');
    const logical = 'tours/summer-1/cover.jpg';
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe(`https://cdn.example.com/${logical}`);
      return new Response('cover-bytes', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
    const resolved = await copyOgShellAssets(distDir, rootDir, [logical]);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(existsSync(join(distDir, logical))).toBe(true);
    expect(resolved.get(logical)).toBe(logical);
  });

  it('fetches the original CMS WebP cover and maps the converted JPEG for OG metadata', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    vi.stubEnv('VITE_PUBLIC_S3_BASE_URL', 'https://cdn.example.com/');
    const logical = 'media/tours/fall-17/cover.webp';
    const sourceUrl = 'https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-17/cover.webp';
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe(sourceUrl);
      return new Response('original-webp-bytes', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const ensureMock = vi.fn(async (_distDir: string, path: string) => path.replace(/\.webp$/i, '.jpg'));
    vi.doMock('./ogShellTelegramImage.ts', async (importOriginal) => {
      const actual = await importOriginal<typeof import('./ogShellTelegramImage.ts')>();
      return {
        ...actual,
        ensureTelegramFriendlyOgImage: ensureMock,
      };
    });

    try {
      const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
      const resolved = await copyOgShellAssets(
        distDir,
        rootDir,
        [logical],
        new Map([[logical, sourceUrl]]),
        new Set([logical]),
      );

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(existsSync(join(distDir, logical))).toBe(true);
      expect(resolved.get(logical)).toBe('media/tours/fall-17/cover.jpg');
      expect(ensureMock).toHaveBeenCalledWith(distDir, logical, null);
    } finally {
      vi.doUnmock('./ogShellTelegramImage.ts');
      vi.resetModules();
    }
  });

  it('uses the docker-safe local fallback when CDN returns 403 for the default banner', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    await mkdir(join(rootDir, 'public'), { recursive: true });
    await writeFile(join(rootDir, 'public', 'og-fallback-cover.jpg'), 'local-fallback', 'utf8');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('denied', { status: 403 })),
    );

    const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
    const { DEFAULT_OG_SHELL_BANNER_LOGICAL } = await import('../../src/constants/images.ts');
    const resolved = await copyOgShellAssets(distDir, rootDir, [DEFAULT_OG_SHELL_BANNER_LOGICAL]);

    expect(existsSync(join(distDir, DEFAULT_OG_SHELL_BANNER_LOGICAL))).toBe(true);
    expect(resolved.get(DEFAULT_OG_SHELL_BANNER_LOGICAL)).toBe(DEFAULT_OG_SHELL_BANNER_LOGICAL);
  });

  it('does not fail required tour covers when CDN is 403 and a local fallback exists', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    await mkdir(join(rootDir, 'public'), { recursive: true });
    await writeFile(join(rootDir, 'public', 'og-fallback-cover.jpg'), 'local-fallback', 'utf8');
    const logical = 'media/tours/fall-17/cover.webp';
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('denied', { status: 403 })),
    );

    const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
    const resolved = await copyOgShellAssets(
      distDir,
      rootDir,
      [logical],
      new Map([[logical, `https://cdn.example.com/${logical}`]]),
      new Set([logical]),
    );

    expect(existsSync(join(distDir, 'media/tours/fall-17/cover.jpg'))).toBe(true);
    expect(resolved.get(logical)).toBe('media/tours/fall-17/cover.jpg');
  });

  it('uses repo-root og-cover-prod.jpg when Docker has no public/tours and CDN is 403', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'og-copy-root-'));
    distDir = await mkdtemp(join(tmpdir(), 'og-copy-dist-'));
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    await writeFile(join(rootDir, 'og-cover-prod.jpg'), 'prod-og-fallback', 'utf8');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('denied', { status: 403 })),
    );

    const { copyOgShellAssets } = await import('./copyOgShellAssets.ts');
    const { DEFAULT_OG_SHELL_BANNER_LOGICAL } = await import('../../src/constants/images.ts');
    const resolved = await copyOgShellAssets(distDir, rootDir, [DEFAULT_OG_SHELL_BANNER_LOGICAL]);

    expect(existsSync(join(distDir, DEFAULT_OG_SHELL_BANNER_LOGICAL))).toBe(true);
    expect(resolved.get(DEFAULT_OG_SHELL_BANNER_LOGICAL)).toBe(DEFAULT_OG_SHELL_BANNER_LOGICAL);
  });
});

describe('resolveOgShellMeta', { timeout: 20_000 }, () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SITE_URL', 'https://example.com');
    vi.stubEnv('VITE_BASE_PATH', '/');
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', 'https://cdn.example.com/');
    setupOgShellBuildEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('resolves tour detail meta with pipe in title', async () => {
    const { resolveOgShellMeta } = await import('./resolveOgShellMeta.ts');
    const meta = resolveOgShellMeta('/tours/summer/summer-1');
    expect(meta.title).toContain('|');
    expect(meta.title).toContain('Вкрайности');
    expect(meta.description.length).toBeGreaterThan(20);
    expect(meta.imagePathOrUrl.length).toBeGreaterThan(0);
  });

  it('resolves home meta without pipe in title', async () => {
    const { resolveOgShellMeta } = await import('./resolveOgShellMeta.ts');
    const meta = resolveOgShellMeta('/');
    expect(meta.title).toContain('Вкрайности');
    expect(meta.title).not.toContain('|');
  });

  it('keeps the indexable Safety directive in the generated crawlable shell', async () => {
    const { resolveOgShellMeta } = await import('./resolveOgShellMeta.ts');
    const meta = resolveOgShellMeta('/safety');

    expect(meta).toMatchObject({ robots: 'index,follow', includeSocialMetadata: false });
  });

  it('uses CMS tour SEO fields in the generated crawlable shell', async () => {
    const [{ resolveOgShellMeta }, { findTourBySeasonAndSegment }] = await Promise.all([
      import('./resolveOgShellMeta.ts'),
      import('../../src/data/tourLookup.ts'),
    ]);
    const base = findTourBySeasonAndSegment('summer', 'poluostrov-krabbe');
    expect(base).toBeDefined();
    const tour = {
      ...base!,
      seo: {
        title: 'Краббе — маршрут из Владивостока | Вкрайности',
        description: 'Тестовое описание маршрута Краббе.',
        h1: 'Поездка на полуостров Краббе',
        keywords: ['полуостров Краббе'],
      },
    };
    const meta = resolveOgShellMeta('/tours/summer/poluostrov-krabbe', 'active', { toursById: new Map([[tour.id, tour]]) });
    expect(meta).toMatchObject({
      title: tour.seo.title,
      description: tour.seo.description,
      keywords: tour.seo.keywords,
      imagePathOrUrl: expect.stringContaining('summer-8'),
    });
  });

  it('resolves OG metadata for an active CMS tour outside the legacy slug map', async () => {
    const [{ resolveOgShellMeta }, { findTourBySeasonAndSegment }] = await Promise.all([
      import('./resolveOgShellMeta.ts'),
      import('../../src/data/tourLookup.ts'),
    ]);
    const base = findTourBySeasonAndSegment('summer', 'poluostrov-krabbe');
    expect(base).toBeDefined();
    const tour = {
      ...base!,
      id: 'fall-17',
      slug: 'odin-den-v-ta-chingouze-2',
      season: 'fall' as const,
      title: 'Один день в Та-Чингоузе',
      imageUrl: 'https://cdn.example.com/media/tours/fall-17/cover.webp',
      seo: {
        title: 'Один день в Та-Чингоузе — осенний тур | Вкрайности',
        description: 'CMS описание маршрута из Владивостока.',
        h1: 'Осенний день в Та-Чингоузе',
        keywords: ['Та-Чингоуза осенью'],
      },
    };
    const meta = resolveOgShellMeta('/tours/fall/odin-den-v-ta-chingouze-2', 'active', {
      toursById: new Map([[tour.id, tour]]),
    });

    expect(meta).toMatchObject({
      title: tour.seo.title,
      description: tour.seo.description,
      path: '/tours/fall/odin-den-v-ta-chingouze-2/',
      imagePathOrUrl: 'https://cdn.example.com/media/tours/fall-17/cover.webp',
    });
  });
});

describe('collectOgShellImageLogicalPaths', () => {
  it('dedupes paths and includes default banner', async () => {
    const { collectOgShellImageLogicalPaths } = await import('./copyOgShellAssets.ts');
    const paths = collectOgShellImageLogicalPaths([
      'https://cdn.example.com/tours/summer-1/cover.webp',
      '/tours/summer-1/cover.webp',
    ]);
    expect(paths).toContain('banners_summer/summer.jpg');
    expect(paths.filter((p) => p === 'tours/summer-1/cover.webp')).toHaveLength(1);
  });

  it('retains the CMS CDN source URL for the original cover asset', async () => {
    const { collectOgShellSourceUrls } = await import('./copyOgShellAssets.ts');
    const url = 'https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-17/cover.webp';

    expect(collectOgShellSourceUrls([url])).toEqual(
      new Map([['media/tours/fall-17/cover.webp', url]]),
    );
  });
});
