import { readFile, stat } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

const distDir = resolve(process.argv[2] ?? 'dist');
const catalogPath = resolve(distDir, 'data', 'cms', 'tours.json');

let catalog;
try {
  catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
} catch (error) {
  console.error('[verify:cms-media] Cannot read baked tour catalog ' + catalogPath + ': ' + (error instanceof Error ? error.message : String(error)));
  process.exit(1);
}

if (!Array.isArray(catalog?.tours)) {
  console.error('[verify:cms-media] Baked tour catalog has no tours array');
  process.exit(1);
}

const localUrls = new Set();
const missing = [];

for (const tour of catalog.tours) {
  for (const asset of Array.isArray(tour?.assets) ? tour.assets : []) {
    if (typeof asset?.stillUrl !== 'string') continue;
    let pathname;
    try {
      pathname = new URL(asset.stillUrl, 'https://local.invalid').pathname;
    } catch {
      continue;
    }
    if (!pathname.startsWith('/data/cms/media/')) continue;
    localUrls.add(pathname);
  }
}

for (const pathname of localUrls) {
  try {
    const decodedPath = decodeURIComponent(pathname).replace(/^\/+/, '');
    const filePath = resolve(distDir, decodedPath);
    const relativePath = relative(distDir, filePath);
    const parentPrefix = '..' + (process.platform === 'win32' ? '\\' : '/');
    if (relativePath === '..' || relativePath.startsWith(parentPrefix) || isAbsolute(relativePath)) {
      missing.push(pathname + ' (outside dist)');
      continue;
    }
    const file = await stat(filePath);
    if (!file.isFile() || file.size === 0) missing.push(pathname + ' (empty or not a file)');
  } catch {
    missing.push(pathname);
  }
}

if (missing.length > 0) {
  console.error('[verify:cms-media] ' + missing.length + ' of ' + localUrls.size + ' local media URLs are missing from dist:');
  for (const pathname of missing.slice(0, 30)) console.error('  ' + pathname);
  if (missing.length > 30) console.error('  ... and ' + (missing.length - 30) + ' more');
  process.exit(1);
}

console.log('[verify:cms-media] ' + localUrls.size + ' local media URLs verified in dist');
