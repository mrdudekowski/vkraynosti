import { resolveCmsLocalFallbackUrl } from './cmsContentUrls';
import { parsePublicSnapshotRelease } from './publicSnapshotRelease';
import type { PublicSnapshotRelease } from './publicSnapshotSchema';

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`CMS release fetch failed: ${response.status} ${url}`);
  return response.json() as Promise<unknown>;
}

/** Resolve only the immutable release embedded by the current site deployment. */
export async function loadEmbeddedPublicSnapshot(): Promise<PublicSnapshotRelease | null> {
  const toursUrl = resolveCmsLocalFallbackUrl();
  const baseUrl = toursUrl.slice(0, toursUrl.lastIndexOf('/'));
  const markerInput = await fetchJson(`${baseUrl}/build-source.json`);
  if (typeof markerInput !== 'object' || markerInput == null || !('kind' in markerInput)) {
    throw new Error('CMS build marker is invalid');
  }
  const marker = markerInput as { kind?: unknown; releaseId?: unknown; sha256?: unknown; generatedAt?: unknown };
  if (marker.kind === 'legacy') return null;
  if (marker.kind !== 'cms' || typeof marker.releaseId !== 'string' || typeof marker.sha256 !== 'string') {
    throw new Error('CMS build marker has no release identity');
  }
  const release = await parsePublicSnapshotRelease(await fetchJson(`${baseUrl}/release.json`));
  if (
    release.manifest.releaseId !== marker.releaseId ||
    release.manifest.sha256 !== marker.sha256 ||
    release.manifest.generatedAt !== marker.generatedAt
  ) {
    throw new Error('CMS build marker does not match embedded release');
  }
  return release;
}
