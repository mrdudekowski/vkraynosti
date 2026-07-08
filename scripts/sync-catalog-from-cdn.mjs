/**
 * Pull the live tour catalog (tours_list.json + schedule.json) from the CDN into
 * public/data/tour-schedule/ BEFORE the SEO build, so sitemap, robots, prerendered
 * bodies and OG shells reflect the currently published catalog (status flips made via
 * the GAS "Опубликовать" menu) instead of the committed snapshot.
 *
 * Source = same base the app fetches at runtime: VITE_PUBLIC_S3_BASE_URL or
 * VITE_PUBLIC_ASSET_BASE_URL. With no base set, seeds committed fixtures into public/.
 *
 * ponytail: best-effort CDN fetch — on failure per file, keep existing public/ copy or fixture.
 */
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  TOUR_CATALOG_FIXTURE_DIR,
  seedTourCatalogFromFixtures,
} from './lib/readTourCatalogFile.mjs';

const rootDir = process.cwd();
const outDir = resolve(rootDir, 'public/data/tour-schedule');
const CATALOG_FILES = ['tours_list.json', 'schedule.json'];

const resolveCatalogBaseUrl = () => {
  const base = (
    process.env.VITE_PUBLIC_S3_BASE_URL ||
    process.env.VITE_PUBLIC_ASSET_BASE_URL ||
    ''
  ).trim();
  return base.replace(/\/+$/, '');
};

const fetchCatalogJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  JSON.parse(text); // fail fast on malformed payloads before overwriting the snapshot
  return text.endsWith('\n') ? text : `${text}\n`;
};

const run = async () => {
  const base = resolveCatalogBaseUrl();
  if (!base) {
    process.stdout.write('[sync:catalog] no CDN base URL set — seeding from fixtures\n');
    await seedTourCatalogFromFixtures(rootDir);
    return;
  }

  await mkdir(outDir, { recursive: true });
  for (const fileName of CATALOG_FILES) {
    const url = `${base}/tour-schedule/${fileName}`;
    try {
      const body = await fetchCatalogJson(url);
      await writeFile(resolve(outDir, fileName), body, 'utf8');
      process.stdout.write(`[sync:catalog] updated ${fileName} from ${url}\n`);
    } catch (error) {
      process.stdout.write(
        `[sync:catalog] WARN ${fileName} from CDN (${error instanceof Error ? error.message : String(error)}) — using fixture\n`,
      );
      await copyFile(
        resolve(rootDir, TOUR_CATALOG_FIXTURE_DIR, fileName),
        resolve(outDir, fileName),
      );
    }
  }
};

run().catch((error) => {
  process.stderr.write(
    `sync-catalog-from-cdn failed: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
