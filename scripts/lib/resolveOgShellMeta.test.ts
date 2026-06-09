import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupOgShellBuildEnv } from './ogShellEnv.ts';

describe('resolveOgShellMeta', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SITE_URL', 'https://example.com');
    vi.stubEnv('VITE_BASE_PATH', '/');
    vi.stubEnv('VITE_PUBLIC_ASSET_BASE_URL', '');
    setupOgShellBuildEnv();
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
