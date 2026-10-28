import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildCmsPublishedSiteContentUrl } from './cmsContentUrls';
import { loadPublishedSiteContent } from './loadSiteContent';

const teamDocument = { kind: 'team' as const, schemaVersion: 1 as const, members: [] };
const contactsDocument = {
  kind: 'contacts' as const,
  schemaVersion: 1 as const,
  sectionVisible: true,
  channels: [],
};

describe('loadPublishedSiteContent', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('строит URL published site-content без двойного слэша', () => {
    expect(buildCmsPublishedSiteContentUrl('https://s3.example.test/cms/', 'team')).toBe(
      'https://s3.example.test/cms/published/site-content/team/document.json',
    );
  });

  it('loads bake site-content and does not fetch CDN', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => teamDocument,
    });
    vi.stubGlobal('fetch', fetchSpy);
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toMatch(
      /\/data\/cms\/site-content\/team\/document\.json$/,
    );
    expect(String(fetchSpy.mock.calls[0]?.[0])).not.toContain('s3.example.test');
  });

  it('возвращает null при HTTP-ошибке и не ломает приложение', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(loadPublishedSiteContent('contacts')).resolves.toBeNull();
  });

  it('возвращает null для документа неверного типа', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...contactsDocument, kind: 'team' }),
    }));
    await expect(loadPublishedSiteContent('footer')).resolves.toBeNull();
  });

  it('сохраняет последний валидный документ конкретного kind после сбоя сети', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => teamDocument })
      .mockRejectedValueOnce(new Error('offline')));
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
  });
});
