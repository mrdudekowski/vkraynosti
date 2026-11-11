import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultSiteSeoDocument } from '../../src/cms/siteSeoDocument.ts';
import { createPublicSnapshotRelease } from '../../src/cms/publicSnapshotRelease.ts';
import { loadBuildPublicSnapshot } from './loadBuildPublicSnapshot.ts';
import { getRenderableRoutePaths, getSitemapRoutePaths } from './seoRoutes.mjs';

const roots: string[] = [];

async function writeJson(root: string, path: string, value: unknown): Promise<void> {
  const destination = resolve(root, path);
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, `${JSON.stringify(value)}\n`, 'utf8');
}

async function createFixture() {
  const root = await mkdtemp(resolve(tmpdir(), 'vkr-build-release-'));
  roots.push(root);
  for (const relativePath of ['src/constants/routes.ts', 'src/data/tourSlugs.ts']) {
    const source = resolve(process.cwd(), relativePath);
    const destination = resolve(root, relativePath);
    await mkdir(resolve(destination, '..'), { recursive: true });
    await copyFile(source, destination);
  }
  const tour = {
    id: 'fall-1', slug: 'test', season: 'fall', status: 'active', title: 'Test tour',
    subtitle: '', heroPhrase: '', description: 'Description', duration: '1 день', durationDays: 1,
    difficulty: 'Easy', price: '5000 ₽', program: [], included: [], coverAssetId: null,
    prefaceAssetId: null, assets: [], bento: { blocks: [] }, legacyGalleryVariant: null,
  };
  const tours = { schemaVersion: 1, tours: [tour] };
  const toursList = {
    schemaVersion: 1,
    generatedAt: '2026-11-11T00:00:00.000Z',
    tours: [{ id: tour.id, title: tour.title, priceRub: 5000, durationType: 'однодневный', publicationStatus: 'active' }],
  };
  const schedule = { schemaVersion: 1, generatedAt: '2026-11-11T00:00:00.000Z', events: [] };
  const siteSeo = createDefaultSiteSeoDocument();
  const release = await createPublicSnapshotRelease({
    schemaVersion: 1, tours, toursList, schedule,
    siteContent: { seo: siteSeo }, stills: [],
  }, { generatedAt: '2026-11-11T00:00:00.000Z', sourceKind: 'test' });
  await writeJson(root, 'public/data/cms/build-source.json', {
    kind: 'cms', releaseId: release.manifest.releaseId, sha256: release.manifest.sha256,
    seoRevision: release.manifest.seoRevision,
    generatedAt: release.manifest.generatedAt,
  });
  await writeJson(root, 'public/data/cms/release.json', release);
  await writeJson(root, 'public/data/cms/tours.json', tours);
  await writeJson(root, 'public/data/tour-schedule/tours_list.json', toursList);
  await writeJson(root, 'public/data/tour-schedule/schedule.json', schedule);
  await writeJson(root, 'public/data/cms/site-seo/document.json', siteSeo);
  return { root, toursList };
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('loadBuildPublicSnapshot', () => {
  it('accepts the release only when every build projection matches its manifest', async () => {
    const { root, toursList } = await createFixture();
    const snapshot = await loadBuildPublicSnapshot(root);
    expect(snapshot?.release.manifest.releaseId).toMatch(/^seo-[a-f0-9]{24}$/);
    expect(snapshot?.release.payload.toursList).toEqual(toursList);
  });

  it('derives sitemap and renderable routes from the same validated CMS release', async () => {
    const { root } = await createFixture();
    const sitemap = await getSitemapRoutePaths(root);
    const renderable = await getRenderableRoutePaths(root);
    expect(sitemap).toContain('/tours/fall/test');
    expect(renderable).toContain('/tours/fall/test');
    expect(sitemap.filter((path) => path === '/tours/fall/test')).toHaveLength(1);
  });

  it('fails closed when a route-generation projection drifts from the release', async () => {
    const { root, toursList } = await createFixture();
    await writeJson(root, 'public/data/tour-schedule/tours_list.json', {
      ...toursList,
      tours: [{ ...toursList.tours[0], publicationStatus: 'in_development' }],
    });
    await expect(loadBuildPublicSnapshot(root)).rejects.toThrow(/does not match release/);
  });

  it('fails closed when the marker belongs to another build', async () => {
    const { root } = await createFixture();
    await writeJson(root, 'public/data/cms/build-source.json', {
      kind: 'cms', releaseId: 'seo-000000000000000000000000', sha256: '0'.repeat(64),
      seoRevision: '0'.repeat(64),
      generatedAt: '2026-11-11T00:00:00.000Z',
    });
    await expect(loadBuildPublicSnapshot(root)).rejects.toThrow(/does not match release manifest/);
  });
});
