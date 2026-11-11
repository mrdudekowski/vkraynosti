import {
  publicSnapshotReleaseSchema,
  publicSnapshotSchema,
  publicSnapshotManifestSchema,
  type PublicSnapshot,
  type PublicSnapshotRelease,
} from './publicSnapshotSchema';

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

export async function createPublicSnapshotRelease(
  input: unknown,
  options: PublicSnapshotReleaseOptions,
): Promise<PublicSnapshotRelease> {
  const payload = publicSnapshotSchema.parse(input);
  const identity = await snapshotIdentity(payload);
  const manifest = publicSnapshotManifestSchema.parse({
    schemaVersion: 1,
    ...identity,
    generatedAt: options.generatedAt,
    snapshotKey: `published/releases/${identity.releaseId}.json`,
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
  const identity = await snapshotIdentity(release.payload);
  if (
    release.manifest.sha256 !== identity.sha256 ||
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
