import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assertPublicSnapshotToursProjection, parsePublicSnapshotRelease, serializeCanonicalJson } from '../../src/cms/publicSnapshotRelease.ts';
import type { PublicSnapshotRelease } from '../../src/cms/publicSnapshotSchema.ts';

export type CmsBuildMarker = {
  kind: 'cms';
  releaseId: string;
  sha256: string;
  seoRevision: string;
  generatedAt: string;
};

async function readJson(rootDir: string, relativePath: string): Promise<unknown> {
  const filePath = resolve(rootDir, relativePath);
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(`Unable to read CMS build snapshot projection ${relativePath}`, { cause: error });
  }
}

function assertSameProjection(label: string, actual: unknown, expected: unknown): void {
  if (serializeCanonicalJson(actual) !== serializeCanonicalJson(expected)) {
    throw new Error(`CMS build snapshot projection does not match release: ${label}`);
  }
}

/** Read and cross-check the immutable release and every JSON file projected from it. */
export async function loadBuildPublicSnapshot(
  rootDir = process.cwd(),
): Promise<{ marker: CmsBuildMarker; release: PublicSnapshotRelease } | null> {
  const markerPath = resolve(rootDir, 'public/data/cms/build-source.json');
  let markerText: string;
  try {
    markerText = await readFile(markerPath, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw error;
  }
  let markerInput: unknown;
  try {
    markerInput = JSON.parse(markerText) as unknown;
  } catch (error) {
    throw new Error('Invalid CMS build-source marker', { cause: error });
  }
  if (typeof markerInput !== 'object' || markerInput == null || !('kind' in markerInput)) {
    throw new Error('Invalid CMS build-source marker');
  }
  const marker = markerInput as Partial<CmsBuildMarker> & { kind?: unknown };
  if (marker.kind === 'legacy') return null;
  if (marker.kind !== 'cms') throw new Error(`Unknown catalog build-source kind: ${String(marker.kind)}`);
  if (
    typeof marker.releaseId !== 'string' ||
    typeof marker.sha256 !== 'string' ||
    typeof marker.seoRevision !== 'string' ||
    typeof marker.generatedAt !== 'string'
  ) {
    throw new Error('CMS build-source marker is missing release identity');
  }

  const releaseInput = await readJson(rootDir, 'public/data/cms/release.json');
  const release = await parsePublicSnapshotRelease(releaseInput);
  if (
    release.manifest.releaseId !== marker.releaseId ||
    release.manifest.sha256 !== marker.sha256 ||
    release.manifest.seoRevision !== marker.seoRevision ||
    release.manifest.generatedAt !== marker.generatedAt
  ) {
    throw new Error('CMS build-source marker does not match release manifest');
  }

  try {
    assertPublicSnapshotToursProjection(release, await readJson(rootDir, 'public/data/cms/tours.json'));
  } catch (error) {
    throw new Error('CMS build snapshot projection does not match release: tours', { cause: error });
  }
  assertSameProjection('tour-schedule/tours_list.json',
    await readJson(rootDir, 'public/data/tour-schedule/tours_list.json'), release.payload.toursList);
  assertSameProjection('tour-schedule/schedule.json',
    await readJson(rootDir, 'public/data/tour-schedule/schedule.json'), release.payload.schedule);

  for (const [kind, document] of Object.entries(release.payload.siteContent)) {
    if (document == null) continue;
    const relativePath = kind === 'seo'
      ? 'public/data/cms/site-seo/document.json'
      : `public/data/cms/site-content/${kind}/document.json`;
    assertSameProjection(relativePath, await readJson(rootDir, relativePath), document);
  }

  return { marker: marker as CmsBuildMarker, release };
}
