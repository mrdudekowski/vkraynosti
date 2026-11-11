/**
 * Pull the live tour catalog (tours_list.json + schedule.json) from the CDN into
 * public/data/tour-schedule/ BEFORE the SEO build, so sitemap, robots, prerendered
 * bodies and OG shells reflect the currently published catalog (status flips made via
 * the GAS "Опубликовать" menu) instead of the committed snapshot.
 *
 * Prefer the published CMS package when configured so the SEO build sees the same
 * tour IDs, slugs, statuses and schedule as the public runtime. Fall back to the
 * legacy public CDN catalog when CMS is not configured.
 *
 * Legacy CDN fetches retain their fixture fallback. A configured CMS package is treated
 * as authoritative and must be complete before any snapshots are replaced.
 */
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parsePublicSnapshotRelease } from '../src/cms/publicSnapshotRelease.ts';
import { loadDotEnvLocal } from './lib/loadDotEnvLocal.mjs';
import { resolveCatalogSource } from './lib/catalogSource.mjs';
import {
  TOUR_CATALOG_FIXTURE_DIR,
  seedTourCatalogFromFixtures,
} from './lib/readTourCatalogFile.mjs';
import { rewriteBakeStills } from './lib/rewriteBakeStills.mjs';

const rootDir = process.cwd();

const CATALOG_FILES = ['tours_list.json', 'schedule.json'];

async function writeReleaseFiles({ files, markerPath, marker, fileSystem }) {
  const staged = [];
  const cleanup = async () => Promise.all(staged.map(({ tempPath }) => fileSystem.unlink(tempPath).catch(() => {})));

  try {
    for (const file of files) {
      await fileSystem.mkdir(dirname(file.path), { recursive: true });
      const tempPath = `${file.path}.tmp-${randomUUID()}`;
      staged.push({ ...file, tempPath });
      await fileSystem.writeFile(tempPath, file.contents, 'utf8');
    }

    for (const file of staged) {
      await fileSystem.rename(file.tempPath, file.path);
    }

    await fileSystem.mkdir(dirname(markerPath), { recursive: true });
    const markerTempPath = `${markerPath}.tmp-${randomUUID()}`;
    staged.push({ tempPath: markerTempPath });
    await fileSystem.writeFile(markerTempPath, `${JSON.stringify(marker)}\n`, 'utf8');
    await fileSystem.rename(markerTempPath, markerPath);
  } catch (error) {
    await cleanup();
    throw error;
  }
}

const fetchCatalogJson = async (url, fetchImpl = fetch) => {
  const response = await fetchImpl(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  JSON.parse(text); // fail fast on malformed payloads before overwriting the snapshot
  return text.endsWith('\n') ? text : `${text}\n`;
};

const parseSiteSeoPackage = (text, label) => {
  const value = JSON.parse(text);
  const requiredPages = ['home', 'winter', 'spring', 'summer', 'fall', 'privacy'];
  const pages = value?.pages;
  const actualPages = Array.isArray(pages) ? pages.map((page) => page?.key) : [];
  if (
    value?.kind !== 'seo' ||
    value?.schemaVersion !== 1 ||
    !Array.isArray(pages) ||
    requiredPages.some((key) => !actualPages.includes(key)) ||
    actualPages.some((key) => !requiredPages.includes(key)) ||
    new Set(actualPages).size !== requiredPages.length ||
    pages.some((page) => !page || typeof page.path !== 'string' || typeof page.title !== 'string' || typeof page.description !== 'string')
  ) {
    throw new Error(`${label} has an invalid published CMS site SEO shape`);
  }
  return text;
};

export async function syncCatalog({
  root = rootDir,
  env = process.env,
  fetchImpl = fetch,
  fileSystem: fileSystemOverrides = {},
} = {}) {
  const fileSystem = { mkdir, writeFile, rename, unlink, ...fileSystemOverrides };
  const source = resolveCatalogSource(env);
  const scheduleDir = resolve(root, 'public/data/tour-schedule');
  const cmsDir = resolve(root, 'public/data/cms');

  if (source == null) {
    process.stdout.write('[sync:catalog] no CDN base URL set — seeding from fixtures\n');
    await seedTourCatalogFromFixtures(root);
    await mkdir(cmsDir, { recursive: true });
    await writeFile(resolve(cmsDir, 'build-source.json'), '{"kind":"legacy"}\n', 'utf8');
    return;
  }

  await mkdir(scheduleDir, { recursive: true });

  if (source.kind === 'bakeApi') {
    const response = await fetchImpl(source.bakeUrl, {
      headers: { 'x-cms-deploy-secret': source.deploySecret },
      cache: 'no-store',
    });
    if (!response.ok) {
      let apiErrorCode = null;
      try {
        const errorBody = await response.json();
        if (typeof errorBody?.error === 'string' && /^[a-z0-9_-]+$/i.test(errorBody.error)) {
          apiErrorCode = errorBody.error;
        }
      } catch {
        // Keep the diagnostic limited to a safe API error code; never print a raw response body.
      }
      throw new Error(`CMS bake API HTTP ${response.status}${apiErrorCode ? ` (${apiErrorCode})` : ''}`);
    }
    const responseBody = typeof response.json === 'function'
      ? await response.json()
      : JSON.parse(await response.text());
    const release = await parsePublicSnapshotRelease({
      payload: responseBody?.payload,
      manifest: responseBody?.manifest,
    });
    const { tours, toursList, schedule, siteContent } = release.payload;
    const siteSeo = siteContent.seo;
    parseSiteSeoPackage(JSON.stringify(siteSeo), 'CMS bake site SEO document');
    const rewritten = await rewriteBakeStills({ root, tours, fetchImpl });
    const rewrittenToursText = `${JSON.stringify(rewritten)}\n`;
    const cmsScheduleDir = resolve(cmsDir, 'tour-schedule');
    const cmsSiteSeoDir = resolve(cmsDir, 'site-seo');
    const siteContentWrites = Object.entries(siteContent).flatMap(([kind, document]) => {
      if (document == null) {
        return [];
      }
      const dest = kind === 'seo'
        ? resolve(cmsDir, 'site-seo/document.json')
        : resolve(cmsDir, 'site-content', kind, 'document.json');
      return [[dest, `${JSON.stringify(document)}\n`]];
    });
    const toursListText = `${JSON.stringify(toursList)}\n`;
    const scheduleText = `${JSON.stringify(schedule)}\n`;
    const releaseText = `${JSON.stringify(release)}\n`;
    const marker = {
      kind: 'cms',
      releaseId: release.manifest.releaseId,
      sha256: release.manifest.sha256,
      seoRevision: release.manifest.seoRevision,
      generatedAt: release.manifest.generatedAt,
    };
    const files = [
      { path: resolve(cmsDir, 'tours.json'), contents: rewrittenToursText },
      { path: resolve(cmsDir, 'release.json'), contents: releaseText },
      { path: resolve(scheduleDir, 'tours_list.json'), contents: toursListText },
      { path: resolve(scheduleDir, 'schedule.json'), contents: scheduleText },
      { path: resolve(cmsScheduleDir, 'tours_list.json'), contents: toursListText },
      { path: resolve(cmsScheduleDir, 'schedule.json'), contents: scheduleText },
      { path: resolve(cmsSiteSeoDir, 'document.json'), contents: `${JSON.stringify(siteSeo)}\n` },
      ...siteContentWrites.map(([path, contents]) => ({ path, contents })),
    ];
    await writeReleaseFiles({
      files,
      markerPath: resolve(cmsDir, 'build-source.json'),
      marker,
      fileSystem,
    });
    process.stdout.write(`[sync:catalog] baked CMS tours, schedule and site SEO (${rewritten.tours?.length ?? 0} tours)\n`);
    return;
  }

  for (const fileName of CATALOG_FILES) {
    const url = fileName === 'tours_list.json' ? source.toursListUrl : source.scheduleUrl;
    try {
      const body = await fetchCatalogJson(url, fetchImpl);
      await writeFile(resolve(scheduleDir, fileName), body, 'utf8');
      process.stdout.write(`[sync:catalog] updated ${fileName} from ${url}\n`);
    } catch (error) {
      process.stdout.write(
        `[sync:catalog] WARN ${fileName} from CDN (${error instanceof Error ? error.message : String(error)}) — using fixture\n`,
      );
      await copyFile(
        resolve(root, TOUR_CATALOG_FIXTURE_DIR, fileName),
        resolve(scheduleDir, fileName),
      );
    }
  }
  await mkdir(cmsDir, { recursive: true });
  await writeFile(resolve(cmsDir, 'build-source.json'), '{"kind":"legacy"}\n', 'utf8');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(rootDir, 'scripts/sync-catalog-from-cdn.mjs')) {
  loadDotEnvLocal(rootDir);
  syncCatalog().catch((error) => {
    process.stderr.write(
      `sync-catalog-from-cdn failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
