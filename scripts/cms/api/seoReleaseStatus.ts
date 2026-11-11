import type { CmsJsonStore } from './store.ts';
import { loadPublicSnapshotRelease } from './publicSnapshotStore.ts';

export type SeoReleaseDeploymentState = 'current' | 'build_required' | 'unavailable';

export type SeoReleaseDeploymentStatus = {
  state: SeoReleaseDeploymentState;
  currentReleaseId: string;
  liveReleaseId: string | null;
  checkedAt: string;
};

type LiveBuildMarker = {
  kind: 'cms';
  releaseId: string;
  sha256: string;
  seoRevision: string;
};

type SeoReleaseStatusOptions = {
  siteUrl: string;
  sourceKind: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
};

function parseLiveBuildMarker(value: unknown): LiveBuildMarker | null {
  if (typeof value !== 'object' || value == null) return null;
  const marker = value as Record<string, unknown>;
  if (
    marker.kind !== 'cms' ||
    typeof marker.releaseId !== 'string' ||
    !/^seo-[a-f0-9]{24}$/.test(marker.releaseId) ||
    typeof marker.sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(marker.sha256) ||
    typeof marker.seoRevision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(marker.seoRevision)
  ) return null;
  return { kind: 'cms', releaseId: marker.releaseId, sha256: marker.sha256, seoRevision: marker.seoRevision };
}

export async function getSeoReleaseDeploymentStatus(
  store: CmsJsonStore,
  options: SeoReleaseStatusOptions,
): Promise<SeoReleaseDeploymentStatus> {
  const release = await loadPublicSnapshotRelease(store, { sourceKind: options.sourceKind });
  const checkedAt = (options.now?.() ?? new Date()).toISOString();
  const currentReleaseId = release.manifest.releaseId;
  const fetchImpl = options.fetchImpl ?? fetch;

  try {
    const markerUrl = new URL('/data/cms/build-source.json', options.siteUrl);
    const response = await fetchImpl(markerUrl, {
      cache: 'no-store',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      return { state: 'unavailable', currentReleaseId, liveReleaseId: null, checkedAt };
    }
    const marker = parseLiveBuildMarker(await response.json());
    if (marker == null) {
      return { state: 'build_required', currentReleaseId, liveReleaseId: null, checkedAt };
    }
    return {
      state:
        marker.seoRevision === release.manifest.seoRevision
          ? 'current'
          : 'build_required',
      currentReleaseId,
      liveReleaseId: marker.releaseId,
      checkedAt,
    };
  } catch {
    return { state: 'unavailable', currentReleaseId, liveReleaseId: null, checkedAt };
  }
}
