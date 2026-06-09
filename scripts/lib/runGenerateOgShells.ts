import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { getIndexableRoutePaths, routePathToDistFile } from './seoRoutes.mjs';
import { patch404OgShell } from './patch404OgShell.mjs';
import { injectOgShellIntoHtml } from './renderOgShellHead.ts';
import { resolveOgShellMeta } from './resolveOgShellMeta.ts';

const rootDir = process.cwd();
const distDir = resolve(rootDir, 'dist');

export async function runGenerateOgShells(): Promise<void> {
  const templatePath = resolve(distDir, 'index.html');
  let templateHtml: string;
  try {
    templateHtml = await readFile(templatePath, 'utf8');
  } catch {
    throw new Error('dist/index.html not found — run `npm run build` first');
  }

  const routes = await getIndexableRoutePaths(rootDir);
  process.stdout.write(`OG shells: ${routes.length} routes\n`);

  for (const routePath of routes) {
    const meta = resolveOgShellMeta(routePath);
    const html = injectOgShellIntoHtml(templateHtml, meta);
    const filePath = routePathToDistFile(routePath, distDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, html, 'utf8');
    process.stdout.write(`[og-shell] ${routePath}\n`);
  }

  await patch404OgShell(distDir);
  process.stdout.write(`OG shells complete: ${routes.length} routes\n`);
}
