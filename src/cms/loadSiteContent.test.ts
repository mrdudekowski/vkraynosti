import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSiteContentSnapshotCache, loadPublishedSiteContent } from './loadSiteContent';

describe('loadPublishedSiteContent', () => {
  afterEach(() => {
    clearSiteContentSnapshotCache();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('loads and parses an independent published document', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      kind: 'contacts', schemaVersion: 1, sectionVisible: true, channels: [],
    }), { status: 200 })));

    const document = await loadPublishedSiteContent('contacts');
    expect(document?.kind).toBe('contacts');
  });

  it('returns the last valid document after a temporary failure', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://cdn.test');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ kind: 'footer', schemaVersion: 1, blocks: [] }), { status: 200 }))
      .mockRejectedValueOnce(new Error('network'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadPublishedSiteContent('footer')).resolves.toMatchObject({ kind: 'footer' });
    await expect(loadPublishedSiteContent('footer')).resolves.toMatchObject({ kind: 'footer' });
  });

  it('does not fetch when CMS is disabled', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadPublishedSiteContent('team')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
