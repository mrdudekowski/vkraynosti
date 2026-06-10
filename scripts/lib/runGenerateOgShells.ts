import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { TOURS } from '../../src/data/toursData.ts';
import { findTourBySeasonAndSegment } from '../../src/data/tourLookup.ts';
import { getTourCanonicalUrl, validateTourSlugs } from '../../src/constants/tourUrls.ts';
import { getTourLegacyRedirectPaths } from '../../src/constants/tourSeoRoutes.ts';
import { getIndexableRoutePaths } from './seoRoutes.mjs';
import {
  collectOgShellImageLogicalPaths,
  copyOgShellAssets,
  resolveOgShellImageForMeta,
  writeOgShellAssetManifest,
} from './copyOgShellAssets.ts';
import { patch404OgShell } from './patch404OgShell.ts';
import { generateOgTestShell, generateTelegramOgTestShell20260610, OG_TEST_IMAGE_LOGICAL, TELEGRAM_OG_TEST_IMAGE_LOGICAL } from './generateOgTestShell.ts';
import { injectOgShellIntoHtml } from './renderOgShellHead.ts';
import { renderLegacyTourRedirectShell } from './renderLegacyTourRedirectShell.ts';
import { resolveOgShellMeta } from './resolveOgShellMeta.ts';
import { routePathToDistFile } from './seoRoutes.mjs';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

const LEGACY_TOUR_PATH_PATTERN = /^\/tours\/(winter|spring|summer|fall)\/([^/]+)$/;

export async function runGenerateOgShells(): Promise<void> {
  validateTourSlugs(TOURS);

  const templatePath = resolve(distDir, 'index.html');
  let templateHtml: string;
  try {
    templateHtml = await readFile(templatePath, 'utf8');
  } catch {
    throw new Error('dist/index.html not found — run `npm run build` first');
  }

  const routes = await getIndexableRoutePaths(rootDir);
  const routeMetas = routes.map((routePath) => ({
    routePath,
    meta: resolveOgShellMeta(routePath),
  }));

  const logicalPaths = collectOgShellImageLogicalPaths(
    routeMetas.map(({ meta }) => meta.imagePathOrUrl),
  );

  process.stdout.write(`OG shells: ${routes.length} public routes\n`);
  const resolvedPathByRequested = await copyOgShellAssets(distDir, rootDir, logicalPaths);
  const materializedPaths = [...new Set(resolvedPathByRequested.values())];
  await generateOgTestShell(distDir, rootDir);
  await generateTelegramOgTestShell20260610(distDir, rootDir);
  materializedPaths.push(OG_TEST_IMAGE_LOGICAL, TELEGRAM_OG_TEST_IMAGE_LOGICAL);
  await writeOgShellAssetManifest(distDir, materializedPaths);

  for (const { routePath, meta } of routeMetas) {
    const imagePathOrUrl = resolveOgShellImageForMeta(meta.imagePathOrUrl, resolvedPathByRequested);
    const html = injectOgShellIntoHtml(templateHtml, { ...meta, imagePathOrUrl });
    const filePath = routePathToDistFile(routePath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[og-shell] ${routePath}\n`);
  }

  const legacyRoutes = getTourLegacyRedirectPaths();
  for (const legacyPath of legacyRoutes) {
    const match = LEGACY_TOUR_PATH_PATTERN.exec(legacyPath);
    if (match == null) {
      throw new Error(`Invalid legacy tour path: ${legacyPath}`);
    }
    const [, season, segment] = match;
    const tour = findTourBySeasonAndSegment(season as (typeof TOURS)[number]['season'], segment);
    if (tour == null) {
      throw new Error(`Unknown legacy tour path: ${legacyPath}`);
    }
    const canonicalUrl = getTourCanonicalUrl(tour);
    const html = renderLegacyTourRedirectShell(canonicalUrl, tour.title);
    const filePath = routePathToDistFile(legacyPath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[og-shell-legacy] ${legacyPath} -> ${canonicalUrl}\n`);
  }

  await patch404OgShell(distDir);
  process.stdout.write(
    `OG shells complete: ${routes.length} public + ${legacyRoutes.length} legacy redirect routes\n`,
  );
}
