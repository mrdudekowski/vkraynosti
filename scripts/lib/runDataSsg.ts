import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { TOURS } from '../../src/data/toursData.ts';
import { validateTourSlugs } from '../../src/constants/tourUrls.ts';
import { getRenderableRoutePaths, getTourStatusByPublicPath, routePathToDistFile } from './seoRoutes.mjs';
import { injectDataSsgIntoHtml } from './injectDataSsgIntoHtml.ts';
import { loadTourScheduleSnapshot } from './loadTourScheduleSnapshot.ts';
import { resolveDataSsgForRoute } from './renderDataSsgBody.ts';

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
  const routes = await getRenderableRoutePaths(rootDir);
  const statusByPath = await getTourStatusByPublicPath(rootDir);

  process.stdout.write(`Data-SSG: ${routes.length} routes\n`);

  for (const routePath of routes) {
    const { bodyHtml, structuredData } = resolveDataSsgForRoute(
      routePath,
      snapshot,
      statusByPath.get(routePath),
    );
    const html = injectDataSsgIntoHtml(templateHtml, { bodyHtml, structuredData });
    const filePath = routePathToDistFile(routePath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[data-ssg] ${routePath}\n`);
  }

  process.stdout.write(`Data-SSG complete: ${routes.length} routes\n`);
}
