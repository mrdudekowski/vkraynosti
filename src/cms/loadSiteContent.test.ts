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

  it('не обращается к сети без CMS env', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await expect(loadPublishedSiteContent('team')).resolves.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('загружает и валидирует опубликованный документ', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => teamDocument }));
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
    expect(fetch).toHaveBeenCalledWith(
      'https://s3.example.test/cms/published/site-content/team/document.json',
    );
  });

  it('возвращает null при HTTP-ошибке и не ломает приложение', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(loadPublishedSiteContent('contacts')).resolves.toBeNull();
  });

  it('возвращает null для документа неверного типа', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ...contactsDocument, kind: 'team' }),
    }));
    await expect(loadPublishedSiteContent('footer')).resolves.toBeNull();
  });

  it('сохраняет последний валидный документ конкретного kind после сбоя сети', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => teamDocument })
      .mockRejectedValueOnce(new Error('offline')));
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
  });
});
