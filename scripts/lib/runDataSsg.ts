import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { TOURS } from '../../src/data/toursData.ts';
import { validateTourSlugs } from '../../src/constants/tourUrls.ts';
import { serializeJsonForScriptTag } from '../../src/utils/tourSchedule/tourScheduleBootstrap.ts';
import { getRenderableRoutePaths, getTourStatusByPublicPath, routePathToDistFile } from './seoRoutes.mjs';
import { injectDataSsgIntoHtml } from './injectDataSsgIntoHtml.ts';
import { loadTourScheduleSnapshot } from './loadTourScheduleSnapshot.ts';
import { loadTourScheduleBootstrapPayload } from './loadTourScheduleBootstrapPayload.ts';
import { resolveDataSsgForRoute } from './renderDataSsgBody.ts';
import { runTelegramSpaShells } from './runTelegramSpaShells.ts';
import { loadCmsToursFile } from '../../src/cms/loadCmsToursFile.ts';
import { cmsDocumentToSiteTour } from '../../src/cms/cmsDocumentToSiteTour.ts';
import { loadPublishedSiteContent } from '../../src/cms/loadSiteContent.ts';
import type { SiteSeoDocument } from '../../src/cms/siteSeoDocument.ts';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

export async function runDataSsg(): Promise<void> {
  validateTourSlugs(TOURS);

  const templatePath = resolve(distDir, 'index.html');
  let templateHtml: string;
  try {
    templateHtml = await readFile(templatePath, 'utf8');
  } catch {
    throw new Error('dist/index.html not found — run `npm run build` first');
  }

  const snapshot = await loadTourScheduleSnapshot(rootDir);
  const bootstrapPayload = await loadTourScheduleBootstrapPayload(rootDir);
  const tourScheduleBootstrapJson = serializeJsonForScriptTag(bootstrapPayload);
  const routes = await getRenderableRoutePaths(rootDir);
  const statusByPath = await getTourStatusByPublicPath(rootDir);
  const [cmsTours, siteSeoDocument] = await Promise.all([
    loadCmsToursFile(),
    loadPublishedSiteContent('seo'),
  ]);
  const toursById = new Map((cmsTours?.tours ?? []).map((document) => [document.id, cmsDocumentToSiteTour(document)]));
  const siteSeo = siteSeoDocument?.kind === 'seo' ? siteSeoDocument as SiteSeoDocument : null;

  process.stdout.write(`Data-SSG: ${routes.length} routes\n`);

  for (const routePath of routes) {
    const { bodyHtml, structuredData } = resolveDataSsgForRoute(
      routePath,
      snapshot,
      statusByPath.get(routePath),
      { toursById, siteSeo },
    );
    const html = injectDataSsgIntoHtml(templateHtml, {
      bodyHtml,
      structuredData,
      tourScheduleBootstrapJson,
    });
    const filePath = routePathToDistFile(routePath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[data-ssg] ${routePath}\n`);
  }

  await runTelegramSpaShells(distDir, templateHtml, tourScheduleBootstrapJson);

  process.stdout.write(`Data-SSG complete: ${routes.length} routes\n`);
}
