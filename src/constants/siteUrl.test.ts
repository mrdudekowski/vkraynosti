import { describe, expect, it, vi } from 'vitest';

describe('SITE_URL', () => {
  it('uses default GitHub Pages URL when VITE_SITE_URL is unset', async () => {
    vi.stubEnv('VITE_SITE_URL', '');
    vi.resetModules();
    const { DEFAULT_SITE_URL, SITE_URL } = await import('./siteUrl');
    expect(DEFAULT_SITE_URL).toBe('https://mrdudekowski.github.io/vkraynosti');
    expect(SITE_URL).toBe(DEFAULT_SITE_URL);
    vi.unstubAllEnvs();
  });

  it('uses VITE_SITE_URL when set', async () => {
    vi.stubEnv('VITE_SITE_URL', 'https://prod.example.com/');
    vi.resetModules();
    const { SITE_URL } = await import('./siteUrl');
    expect(SITE_URL).toBe('https://prod.example.com/');
    vi.unstubAllEnvs();
  });
});
