import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { TOURS } from '../../src/data/toursData.ts';
import { findTourBySeasonAndSegment } from '../../src/data/tourLookup.ts';
import { getTourCanonicalUrl, validateTourSlugs } from '../../src/constants/tourUrls.ts';
import { getTourLegacyRedirectPaths } from '../../src/constants/tourSeoRoutes.ts';
import { getRenderableRoutePaths, getTourStatusByPublicPath } from './seoRoutes.mjs';
import {
  collectOgShellImageLogicalPaths,
  collectOgShellImageSources,
  collectOgShellSourceUrls,
  copyOgShellAssets,
  resolveOgShellFallbackSourcePath,
  resolveOgShellImageForMeta,
  writeOgShellAssetManifest,
} from './copyOgShellAssets.ts';
import { patch404OgShell } from './patch404OgShell.ts';
import { generateOgTestShell, generateTelegramOgTestShell20260610, OG_TEST_IMAGE_LOGICAL, TELEGRAM_OG_TEST_IMAGE_LOGICAL } from './generateOgTestShell.ts';
import { injectOgShellIntoHtml } from './renderOgShellHead.ts';
import { renderLegacyTourRedirectShell } from './renderLegacyTourRedirectShell.ts';
import { renderLegacyRedirectRules } from './renderLegacyRedirectRules.ts';
import { resolveOgShellMeta } from './resolveOgShellMeta.ts';
import { routePathToDistFile } from './seoRoutes.mjs';
import { OG_FALLBACK_JPEG_LOGICAL } from './ogShellTelegramImage.ts';
import { loadBuildCmsToursFile } from './loadBuildCmsTours.ts';
import { cmsDocumentToSiteTour } from '../../src/cms/cmsDocumentToSiteTour.ts';
import { loadBuildPublishedSiteContent } from './loadBuildSiteContent.ts';
import { resolveOgShellLogicalImagePath } from '../../src/constants/seo.ts';

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

  const fallbackJpegSource = resolve(rootDir, OG_FALLBACK_JPEG_LOGICAL);
  const fallbackJpegPath = resolve(distDir, OG_FALLBACK_JPEG_LOGICAL);
  const localOgFallback = resolveOgShellFallbackSourcePath(rootDir);
  await mkdir(dirname(fallbackJpegPath), { recursive: true });
  const jpegSource = existsSync(fallbackJpegSource)
    ? fallbackJpegSource
    : localOgFallback;
  if (jpegSource == null) {
    throw new Error('OG shell fallback JPEG is missing from the build context');
  }
  await copyFile(jpegSource, fallbackJpegPath);

  const [cmsTours, siteSeoDocument] = await Promise.all([
    loadBuildCmsToursFile(rootDir),
    loadBuildPublishedSiteContent('seo', rootDir),
  ]);
  const routes = await getRenderableRoutePaths(rootDir, cmsTours?.tours);
  const statusByPath = await getTourStatusByPublicPath(rootDir, cmsTours?.tours);
  const overrides = {
    toursById: new Map((cmsTours?.tours ?? []).map((document) => [document.id, cmsDocumentToSiteTour(document)])),
    siteSeo: siteSeoDocument?.kind === 'seo' ? siteSeoDocument : null,
  };
  const routeMetas = routes.map((routePath) => ({
    routePath,
    meta: resolveOgShellMeta(routePath, statusByPath.get(routePath), overrides),
  }));

  const imageSources = collectOgShellImageSources(routeMetas.map(({ meta }) => meta));
  const logicalPaths = collectOgShellImageLogicalPaths(imageSources);
  const sourceUrls = collectOgShellSourceUrls(imageSources);
  const requiredTourCoverPaths = new Set(
    routeMetas
      .filter(({ routePath }) => /^\/tours\/(winter|spring|summer|fall)\//.test(routePath))
      .map(({ meta }) => resolveOgShellLogicalImagePath(meta.imagePathOrUrl)),
  );

  process.stdout.write(`OG shells: ${routes.length} public routes\n`);
  const resolvedPathByRequested = await copyOgShellAssets(
    distDir,
    rootDir,
    logicalPaths,
    sourceUrls,
    requiredTourCoverPaths,
  );
  const materializedPaths = [...new Set(resolvedPathByRequested.values())];
  await generateOgTestShell(distDir, rootDir);
  await generateTelegramOgTestShell20260610(distDir, rootDir);
  materializedPaths.push(OG_TEST_IMAGE_LOGICAL, TELEGRAM_OG_TEST_IMAGE_LOGICAL);
  await writeOgShellAssetManifest(distDir, materializedPaths);

  for (const { routePath, meta } of routeMetas) {
    const imagePathOrUrl = meta.includeSocialMetadata === false
      ? ''
      : resolveOgShellImageForMeta(meta.imagePathOrUrl, resolvedPathByRequested);
    const filePath = routePathToDistFile(routePath, distDir);
    // Overlay meta onto the route's data-SSG HTML when present: keeps rendered
    // <body> and JSON-LD from data-SSG, replaces only head meta with the Telegram-optimized
    // OG block. Falls back to the SPA shell template when data-SSG did not run for this route.
    const routeTemplate = await readFile(filePath, 'utf8').catch(() => templateHtml);
    const html = injectOgShellIntoHtml(routeTemplate, { ...meta, imagePathOrUrl });
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[og-shell] ${routePath}\n`);
  }

  const legacyRoutes = getTourLegacyRedirectPaths();
  const legacyRedirectRules: Array<{ from: string; to: string }> = [];
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
    legacyRedirectRules.push({ from: legacyPath, to: new URL(canonicalUrl).pathname });
    const html = renderLegacyTourRedirectShell(canonicalUrl, tour.title);
    const filePath = routePathToDistFile(legacyPath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[og-shell-legacy] ${legacyPath} -> ${canonicalUrl}\n`);
  }

  await writeFile(resolve(distDir, 'legacy-redirects.caddy'), renderLegacyRedirectRules(legacyRedirectRules), 'utf8');

  await patch404OgShell(distDir);
  process.stdout.write(
    `OG shells complete: ${routes.length} public + ${legacyRoutes.length} legacy redirect routes\n`,
  );
}
