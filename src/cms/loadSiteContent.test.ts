import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPublicSnapshotRelease } from './publicSnapshotRelease';
import { buildCmsPublishedSiteContentUrl } from './cmsContentUrls';
import { loadPublishedSiteContent } from './loadSiteContent';
import { createDefaultSiteSeoDocument } from './siteSeoDocument';

const teamDocument = { kind: 'team' as const, schemaVersion: 1 as const, members: [] };
const contactsDocument = {
  kind: 'contacts' as const, schemaVersion: 1 as const, sectionVisible: true, channels: [],
};

async function stubRelease(siteContent: Record<string, unknown>, selectedDocument?: unknown) {
  const release = await createPublicSnapshotRelease({
    schemaVersion: 1,
    tours: { schemaVersion: 1, tours: [] },
    toursList: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', tours: [] },
    schedule: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] },
    siteContent: { seo: createDefaultSiteSeoDocument(), ...siteContent },
    stills: [],
  }, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'test' });
  const marker = {
    kind: 'cms', releaseId: release.manifest.releaseId, sha256: release.manifest.sha256,
    generatedAt: release.manifest.generatedAt,
  };
  const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const value = url.endsWith('/build-source.json') ? marker
      : url.endsWith('/release.json') ? release
        : selectedDocument;
    return value === undefined
      ? { ok: false, status: 404, json: async () => null }
      : { ok: true, json: async () => value };
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

describe('loadPublishedSiteContent', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('builds the published site-content URL without a double slash', () => {
    expect(buildCmsPublishedSiteContentUrl('https://s3.example.test/cms/', 'team')).toBe(
      'https://s3.example.test/cms/published/site-content/team/document.json',
    );
  });

  it('loads only a site-content document that matches the deployed release', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    const fetchSpy = await stubRelease({ team: teamDocument }, teamDocument);
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
    expect(fetchSpy.mock.calls.map(([url]) => String(url))).toEqual([
      '/data/cms/build-source.json', '/data/cms/release.json', '/data/cms/site-content/team/document.json',
    ]);
  });

  it('does not apply a site-content document from another release', async () => {
    const differentContacts = { ...contactsDocument, sectionVisible: false };
    await stubRelease({ contacts: contactsDocument }, differentContacts);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(loadPublishedSiteContent('contacts')).resolves.toBeNull();
  });

  it('loads bake SEO from the release and never fetches CDN content', async () => {
    vi.stubEnv('VITE_CMS_S3_BASE_URL', 'https://s3.example.test/cms');
    const seoDocument = createDefaultSiteSeoDocument();
    const fetchSpy = await stubRelease({}, seoDocument);
    await expect(loadPublishedSiteContent('seo')).resolves.toEqual(seoDocument);
    expect(String(fetchSpy.mock.calls.at(-1)?.[0])).toMatch(/\/data\/cms\/site-seo\/document\.json$/);
    expect(fetchSpy.mock.calls.some(([url]) => String(url).includes('s3.example.test'))).toBe(false);
  });

  it('returns null when the released document is absent', async () => {
    const fetchSpy = await stubRelease({ contacts: null });
    await expect(loadPublishedSiteContent('contacts')).resolves.toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('returns null for a document with the wrong kind', async () => {
    await stubRelease({ footer: contactsDocument }, { ...contactsDocument, kind: 'team' });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(loadPublishedSiteContent('footer')).resolves.toBeNull();
  });

  it('keeps the last valid document for the same release after a transient document fetch failure', async () => {
    await stubRelease({ team: teamDocument }, teamDocument);
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
    await stubRelease({ team: teamDocument });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(loadPublishedSiteContent('team')).resolves.toEqual(teamDocument);
  });
});
