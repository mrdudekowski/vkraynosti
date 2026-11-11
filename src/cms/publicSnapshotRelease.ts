import {
  publicSnapshotReleaseSchema,
  publicSnapshotSchema,
  publicSnapshotManifestSchema,
  type PublicSnapshot,
  type PublicSnapshotRelease,
} from './publicSnapshotSchema';
import { parseCmsToursFile } from './cmsTourDocument';

export type PublicSnapshotReleaseOptions = {
  generatedAt: string;
  sourceKind: string;
};

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value == null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, nested]) => [key, canonicalize(nested)]),
  );
}

export function serializeCanonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function serializePublicSnapshot(snapshot: PublicSnapshot): string {
  return serializeCanonicalJson(snapshot);
}

/**
 * Hashes only fields that can change indexable HTML, canonical routes, sitemap
 * membership, structured data, or rendered departure dates. Calendar seat counts,
 * comments, and generated timestamps remain in the full release but do not require
 * an SEO rebuild by themselves.
 */
export function serializeSeoRelevantSnapshot(snapshot: PublicSnapshot): string {
  return serializeCanonicalJson({
    tours: snapshot.tours,
    toursList: snapshot.toursList.tours,
    schedule: snapshot.schedule.events.map(({ date, tourId, status, durationType }) => ({
      date, tourId, status, ...(durationType == null ? {} : { durationType }),
    })),
    siteContent: snapshot.siteContent,
    stills: snapshot.stills,
  });
}

export function assertPublicSnapshotToursProjection(release: PublicSnapshotRelease, input: unknown): void {
  const actual = parseCmsToursFile(input);
  const expected = structuredClone(release.payload.tours);
  if (actual.tours.length !== expected.tours.length) {
    throw new Error('Baked tour catalog does not match the public snapshot');
  }
  for (let tourIndex = 0; tourIndex < expected.tours.length; tourIndex += 1) {
    const expectedTour = expected.tours[tourIndex];
    const actualTour = actual.tours[tourIndex];
    if (expectedTour.id !== actualTour.id || expectedTour.assets.length !== actualTour.assets.length) {
      throw new Error(`Baked tour catalog does not match snapshot tour ${expectedTour.id}`);
    }
    for (let assetIndex = 0; assetIndex < expectedTour.assets.length; assetIndex += 1) {
      const expectedAsset = expectedTour.assets[assetIndex];
      const actualAsset = actualTour.assets[assetIndex];
      if (!actualAsset.stillUrl.startsWith('/data/cms/media/tours/')) continue;
      let expectedPath: string;
      try {
        expectedPath = new URL(expectedAsset.stillUrl).pathname;
      } catch {
        throw new Error(`Invalid source media URL in snapshot tour ${expectedTour.id}`);
      }
      const expectedBakePath = expectedPath.startsWith(`/media/tours/${expectedTour.id}/`)
        ? `/data/cms${expectedPath}`
        : null;
      if (expectedBakePath !== actualAsset.stillUrl) {
        throw new Error(`Baked media does not match snapshot tour ${expectedTour.id}`);
      }
      expectedAsset.stillUrl = actualAsset.stillUrl;
    }
  }
  if (serializeCanonicalJson(actual) !== serializeCanonicalJson(expected)) {
    throw new Error('Baked tour catalog does not match the public snapshot');
  }
}

function freezeRecursively<T>(value: T): T {
  if (value != null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeRecursively(child);
  }
  return value;
}

async function snapshotIdentity(payload: PublicSnapshot): Promise<{ sha256: string; releaseId: string }> {
  const bytes = new TextEncoder().encode(serializePublicSnapshot(payload));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return { sha256, releaseId: `seo-${sha256.slice(0, 24)}` };
}

async function seoRevision(payload: PublicSnapshot): Promise<string> {
  const bytes = new TextEncoder().encode(serializeSeoRelevantSnapshot(payload));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function createPublicSnapshotRelease(
  input: unknown,
  options: PublicSnapshotReleaseOptions,
): Promise<PublicSnapshotRelease> {
  const payload = publicSnapshotSchema.parse(input);
  const [identity, seoRevisionValue] = await Promise.all([
    snapshotIdentity(payload),
    seoRevision(payload),
  ]);
  const manifest = publicSnapshotManifestSchema.parse({
    schemaVersion: 1,
    ...identity,
    generatedAt: options.generatedAt,
    snapshotKey: `published/releases/${identity.releaseId}.json`,
    seoRevision: seoRevisionValue,
    sourceKind: options.sourceKind,
  });
  const release = publicSnapshotReleaseSchema.parse({
    payload,
    manifest,
  });
  freezeRecursively(release.payload);
  return release;
}

export async function parsePublicSnapshotRelease(input: unknown): Promise<PublicSnapshotRelease> {
  const release = publicSnapshotReleaseSchema.parse(input);
  const [identity, currentSeoRevision] = await Promise.all([
    snapshotIdentity(release.payload),
    seoRevision(release.payload),
  ]);
  if (
    release.manifest.sha256 !== identity.sha256 ||
    release.manifest.seoRevision !== currentSeoRevision ||
    release.manifest.releaseId !== identity.releaseId ||
    release.manifest.snapshotKey !== `published/releases/${identity.releaseId}.json`
  ) {
    throw new Error('Public snapshot manifest does not match payload identity');
  }
  return {
    ...release,
    payload: freezeRecursively(release.payload),
  };
}
