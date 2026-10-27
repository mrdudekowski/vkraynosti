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
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { loadDotEnvLocal } from './lib/loadDotEnvLocal.mjs';
import { resolveCatalogSource } from './lib/catalogSource.mjs';
import {
  TOUR_CATALOG_FIXTURE_DIR,
  seedTourCatalogFromFixtures,
} from './lib/readTourCatalogFile.mjs';
import { rewriteBakeStills } from './lib/rewriteBakeStills.mjs';

const rootDir = process.cwd();

const CATALOG_FILES = ['tours_list.json', 'schedule.json'];

const fetchCatalogJson = async (url, fetchImpl = fetch) => {
  const response = await fetchImpl(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  JSON.parse(text); // fail fast on malformed payloads before overwriting the snapshot
  return text.endsWith('\n') ? text : `${text}\n`;
};

const parsePackage = (text, label, arrayKey) => {
  const value = JSON.parse(text);
  if (value?.schemaVersion !== 1 || !Array.isArray(value[arrayKey])) {
    throw new Error(`${label} has an invalid published CMS package shape`);
  }
  if (label.endsWith('/published/tours.json') && value.tours.some((tour) =>
    !tour || typeof tour.id !== 'string' || typeof tour.slug !== 'string' ||
    typeof tour.season !== 'string' || typeof tour.status !== 'string')) {
    throw new Error(`${label} contains an invalid tour document`);
  }
  if (arrayKey === 'tours' && value.tours.some((tour) => !tour || typeof tour.id !== 'string' || !tour.id)) {
    throw new Error(`${label} contains a tour without an id`);
  }
  return text;
};

export async function syncCatalog({
  root = rootDir,
  env = process.env,
  fetchImpl = fetch,
} = {}) {
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
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = typeof response.json === 'function'
      ? await response.json()
      : JSON.parse(await response.text());
    const tours = payload?.tours ?? { schemaVersion: 1, tours: [] };
    const toursList = payload?.toursList ?? { schemaVersion: 1, tours: [] };
    const schedule = payload?.schedule ?? { schemaVersion: 1, events: [] };
    const toursListText = `${JSON.stringify(toursList)}\n`;
    const scheduleText = `${JSON.stringify(schedule)}\n`;
    await mkdir(cmsDir, { recursive: true });
    const rewritten = await rewriteBakeStills({ root, tours, fetchImpl });
    const rewrittenToursText = `${JSON.stringify(rewritten)}\n`;
    const cmsScheduleDir = resolve(cmsDir, 'tour-schedule');
    await mkdir(cmsScheduleDir, { recursive: true });
    const siteContentWrites = Object.entries(payload?.siteContent ?? {}).flatMap(([kind, document]) => {
      if (document == null) {
        return [];
      }
      const dest = kind === 'seo'
        ? resolve(cmsDir, 'site-seo/document.json')
        : resolve(cmsDir, 'site-content', kind, 'document.json');
      return [[dest, `${JSON.stringify(document)}\n`]];
    });
    await Promise.all([
      writeFile(resolve(cmsDir, 'tours.json'), rewrittenToursText, 'utf8'),
      writeFile(resolve(scheduleDir, 'tours_list.json'), toursListText, 'utf8'),
      writeFile(resolve(scheduleDir, 'schedule.json'), scheduleText, 'utf8'),
      writeFile(resolve(cmsScheduleDir, 'tours_list.json'), toursListText, 'utf8'),
      writeFile(resolve(cmsScheduleDir, 'schedule.json'), scheduleText, 'utf8'),
      writeFile(resolve(cmsDir, 'build-source.json'), '{"kind":"cms"}\n', 'utf8'),
      ...siteContentWrites.map(async ([dest, body]) => {
        await mkdir(dirname(dest), { recursive: true });
        await writeFile(dest, body, 'utf8');
      }),
    ]);
    process.stdout.write(`[sync:catalog] baked CMS tours and schedule (${rewritten.tours?.length ?? 0} tours)\n`);
    return;
  }

  if (source.kind === 'cms') {
    const [toursText, toursListText, scheduleText] = await Promise.all([
      fetchCatalogJson(source.toursUrl, fetchImpl),
      fetchCatalogJson(source.toursListUrl, fetchImpl),
      fetchCatalogJson(source.scheduleUrl, fetchImpl),
    ]);
    parsePackage(toursText, source.toursUrl, 'tours');
    parsePackage(toursListText, source.toursListUrl, 'tours');
    parsePackage(scheduleText, source.scheduleUrl, 'events');
    await mkdir(cmsDir, { recursive: true });
    const rewritten = await rewriteBakeStills({
      root,
      tours: JSON.parse(toursText),
      fetchImpl,
    });
    const rewrittenToursText = `${JSON.stringify(rewritten)}\n`;
    const cmsScheduleDir = resolve(cmsDir, 'tour-schedule');
    await mkdir(cmsScheduleDir, { recursive: true });
    await Promise.all([
      writeFile(resolve(cmsDir, 'tours.json'), rewrittenToursText, 'utf8'),
      writeFile(resolve(scheduleDir, 'tours_list.json'), toursListText, 'utf8'),
      writeFile(resolve(scheduleDir, 'schedule.json'), scheduleText, 'utf8'),
      writeFile(resolve(cmsScheduleDir, 'tours_list.json'), toursListText, 'utf8'),
      writeFile(resolve(cmsScheduleDir, 'schedule.json'), scheduleText, 'utf8'),
      writeFile(resolve(cmsDir, 'build-source.json'), '{"kind":"cms"}\n', 'utf8'),
    ]);
    process.stdout.write(`[sync:catalog] updated published CMS tours and schedule (${JSON.parse(toursText).tours.length} tours)\n`);
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
