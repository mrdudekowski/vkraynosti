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
    const logical = 'tours/summer/summer-1/cover.webp';
    const publicDir = join(rootDir, 'public', 'tours/summer/summer-1');
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, 'cover.webp'), 'cover-bytes', 'utf8');

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
});

describe('resolveOgShellMeta', () => {
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
});

describe('collectOgShellImageLogicalPaths', () => {
  it('dedupes paths and includes default banner', async () => {
    const { collectOgShellImageLogicalPaths } = await import('./copyOgShellAssets.ts');
    const paths = collectOgShellImageLogicalPaths([
      'https://cdn.example.com/tours/summer-1/cover.webp',
      '/tours/summer-1/cover.webp',
    ]);
    expect(paths).toContain('banners_summer/Summer.webp');
    expect(paths.filter((p) => p === 'tours/summer-1/cover.webp')).toHaveLength(1);
  });
});
