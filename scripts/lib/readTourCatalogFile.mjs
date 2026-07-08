import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const TOUR_CATALOG_PUBLIC_DIR = 'public/data/tour-schedule';
export const TOUR_CATALOG_FIXTURE_DIR = 'scripts/fixtures/tour-schedule';
export const TOUR_CATALOG_FILES = ['tours_list.json', 'schedule.json'];

/**
 * Read catalog JSON: live snapshot in public/ (from sync:catalog) or committed fixture.
 * ponytail: fixtures keep local npm test and TimeWeb build:deploy working without CDN env.
 */
export async function readTourCatalogFile(rootDir, fileName) {
  const publicPath = resolve(rootDir, TOUR_CATALOG_PUBLIC_DIR, fileName);
  try {
    return await readFile(publicPath, 'utf8');
  } catch {
    const fixturePath = resolve(rootDir, TOUR_CATALOG_FIXTURE_DIR, fileName);
    try {
      return await readFile(fixturePath, 'utf8');
    } catch (cause) {
      throw new Error(
        `Tour catalog file not found at ${publicPath} (or fixture ${fixturePath}) — run \`npm run sync:catalog\` first`,
        { cause },
      );
    }
  }
}

/** Copy fixture catalog into public/data/tour-schedule/ when CDN sync is unavailable. */
export async function seedTourCatalogFromFixtures(rootDir = process.cwd()) {
  const outDir = resolve(rootDir, TOUR_CATALOG_PUBLIC_DIR);
  await mkdir(outDir, { recursive: true });
  for (const fileName of TOUR_CATALOG_FILES) {
    const fixturePath = resolve(rootDir, TOUR_CATALOG_FIXTURE_DIR, fileName);
    await copyFile(fixturePath, resolve(outDir, fileName));
    process.stdout.write(`[catalog] seeded ${fileName} from fixtures\n`);
  }
}
