/** @vitest-environment node */
import { describe, expect, it, vi } from 'vitest';
import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
} from '../../../src/cms/cmsPackageKeys.ts';
import { createDefaultSiteSeoDocument } from '../../../src/cms/siteSeoDocument.ts';
import { siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { createMemoryJsonStore } from './store.ts';
import { getSeoReleaseDeploymentStatus } from './seoReleaseStatus.ts';
import { loadPublicSnapshotRelease } from './publicSnapshotStore.ts';

const makeStore = () => createMemoryJsonStore({
  [CMS_PUBLISHED_CATALOG_KEY]: { schemaVersion: 1, tours: [] },
  [CMS_PUBLISHED_TOURS_LIST_KEY]: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', tours: [] },
  [CMS_PUBLISHED_SCHEDULE_KEY]: { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] },
  [siteContentPublishedKey('seo')]: createDefaultSiteSeoDocument(),
  ...Object.fromEntries([
    'team', 'contacts', 'footer', 'modal', 'policy-offer-and-safety',
    'policy-payment-cancellation-refund', 'policy-personal-data-policy', 'policy-personal-data-consent',
  ].map((kind) => [`published/site-content/${kind}/document.json`, null])),
});

const markerResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
});

describe('CMS public SEO release status', () => {
  it('reports current when the live SEO revision matches the current CMS release', async () => {
    const store = makeStore();
    const release = await loadPublicSnapshotRelease(store, { sourceKind: 'test' });
    const fetchImpl = vi.fn().mockResolvedValue(markerResponse({
      kind: 'cms',
      releaseId: release.manifest.releaseId,
      sha256: release.manifest.sha256,
      seoRevision: release.manifest.seoRevision,
    }));

    const status = await getSeoReleaseDeploymentStatus(store, {
      siteUrl: 'https://vkraynosti.ru', sourceKind: 'test', fetchImpl,
      now: () => new Date('2026-11-11T00:00:00.000Z'),
    });

    expect(status).toEqual({
      state: 'current',
      currentReleaseId: release.manifest.releaseId,
      liveReleaseId: release.manifest.releaseId,
      checkedAt: '2026-11-11T00:00:00.000Z',
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL('https://vkraynosti.ru/data/cms/build-source.json'),
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('ignores non-SEO release differences when the public SEO revision matches', async () => {
    const store = makeStore();
    const release = await loadPublicSnapshotRelease(store, { sourceKind: 'test' });
    const status = await getSeoReleaseDeploymentStatus(store, {
      siteUrl: 'https://vkraynosti.ru',
      sourceKind: 'test',
      fetchImpl: vi.fn().mockResolvedValue(markerResponse({
        kind: 'cms',
        releaseId: `seo-${'a'.repeat(24)}`,
        sha256: 'a'.repeat(64),
        seoRevision: release.manifest.seoRevision,
      })),
    });

    expect(status.state).toBe('current');
  });

  it('reports that a public build is needed when the live SEO revision differs', async () => {
    const current = await loadPublicSnapshotRelease(makeStore(), { sourceKind: 'test' });
    const status = await getSeoReleaseDeploymentStatus(makeStore(), {
      siteUrl: 'https://vkraynosti.ru',
      sourceKind: 'test',
      fetchImpl: vi.fn().mockResolvedValue(markerResponse({
        kind: 'cms', releaseId: `seo-${'a'.repeat(24)}`, sha256: 'a'.repeat(64), seoRevision: 'a'.repeat(64),
      })),
    });

    expect(status.state).toBe('build_required');
    expect(status.liveReleaseId).toBe(`seo-${'a'.repeat(24)}`);
    expect(current.manifest.seoRevision).not.toBe('a'.repeat(64));
  });

  it('reports unknown status when the public marker cannot be fetched or validated', async () => {
    const store = makeStore();
    const unavailable = await getSeoReleaseDeploymentStatus(store, {
      siteUrl: 'https://vkraynosti.ru', sourceKind: 'test',
      fetchImpl: vi.fn().mockRejectedValue(new Error('offline')),
    });
    const invalid = await getSeoReleaseDeploymentStatus(store, {
      siteUrl: 'https://vkraynosti.ru', sourceKind: 'test',
      fetchImpl: vi.fn().mockResolvedValue(markerResponse({ kind: 'legacy' })),
    });

    expect(unavailable.state).toBe('unavailable');
    expect(invalid.state).toBe('build_required');
    expect(invalid.liveReleaseId).toBeNull();
  });
});
