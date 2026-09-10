#!/usr/bin/env node
/**
 * Phase 2: inventory public/ media vs TOURS + images.ts + generated bundles.
 * Writes TimeWebDoc/audit-phase2-inventory.json and prints summary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { MEDIA_EXT_RE } from './public-media-budget-core.mjs';
import { loadToursViaVite } from './lib/loadToursViaVite.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const toursRoot = path.join(repoRoot, 'public', 'tours');
const outJson = path.join(repoRoot, 'TimeWebDoc', 'audit-phase2-inventory.json');

const ALLOWED_EXT_RE = /\.(webm|mp4|webp|svg|png|jpe?g|ttf|otf|ico)$/i;
const NAMING_OK_RE = /^[a-z0-9][a-z0-9._-]*$/i;

function walkFiles(directory, predicate = () => true, out = []) {
  if (!fs.existsSync(directory)) return out;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkFiles(absolutePath, predicate, out);
    } else if (predicate(absolutePath)) {
      out.push(absolutePath);
    }
  }
  return out;
}

function normalizeBase(baseUrl) {
  const b = baseUrl ?? '/';
  return b.endsWith('/') ? b : `${b}/`;
}

/** `/vkraynosti/tours/x/y.webp` → `public/tours/x/y.webp` */
export function assetUrlToPublicPath(assetUrl, baseUrl = '/vkraynosti/') {
  if (assetUrl == null || typeof assetUrl !== 'string') return null;
  const trimmed = assetUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return null;
  const normalizedBase = normalizeBase(baseUrl);
  let relative = trimmed;
  if (relative.startsWith(normalizedBase)) {
    relative = relative.slice(normalizedBase.length);
  } else if (relative.startsWith('/')) {
    relative = relative.replace(/^\/+/, '');
    if (normalizedBase !== '/' && relative.startsWith('vkraynosti/')) {
      relative = relative.slice('vkraynosti/'.length);
    }
  }
  if (!relative || relative.includes('..')) return null;
  return path.join('public', relative.replace(/\//g, path.sep));
}

function collectTourMediaUrls(tour) {
  const urls = new Set();
  const add = (value) => {
    if (typeof value === 'string' && value.length > 0) urls.add(value);
  };
  add(tour.imageUrl);
  add(tour.prefaceBackgroundImageUrl);
  if (Array.isArray(tour.galleryImages)) tour.galleryImages.forEach(add);
  if (Array.isArray(tour.galleryGridUrls)) tour.galleryGridUrls.forEach(add);
  const posters = tour.gridVideoPosters;
  if (posters != null && typeof posters === 'object') {
    for (const [grid, poster] of Object.entries(posters)) {
      add(grid);
      add(poster);
    }
  }
  const postersMobile = tour.gridVideoPostersMobile;
  if (postersMobile != null && typeof postersMobile === 'object') {
    for (const [grid, poster] of Object.entries(postersMobile)) {
      add(grid);
      add(poster);
    }
  }
  return urls;
}

function extractImagesTsTourPaths(imagesSource, baseUrl) {
  const paths = new Set();
  const literalRe = /['"`](tours\/[^'"`]+)['"`]/g;
  let match;
  while ((match = literalRe.exec(imagesSource)) !== null) {
    paths.add(path.join('public', match[1].replace(/\//g, path.sep)));
  }
  const toursAssetRe = /\$\{TOURS_ASSET_BASE\}\/([^`'"]+)/g;
  while ((match = toursAssetRe.exec(imagesSource)) !== null) {
    const suffix = match[1].replace(/[`'"]/g, '').trim();
    const baseName = path.posix.basename(suffix);
    if (suffix.length > 0 && baseName.includes('.')) {
      paths.add(path.join('public', 'tours', suffix.replace(/\//g, path.sep)));
    }
  }
  return paths;
}

function collectStringAssetPaths(value, baseUrl, out, { excludeTours = false } = {}) {
  if (typeof value === 'string') {
    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.includes('placehold.co') ||
      value.startsWith('object-gallery-')
    ) {
      return;
    }
    const looksLikeAsset =
      value.startsWith('/') ||
      /\.(webp|webm|svg|mp4|png|jpe?g|ttf|otf)(\?|#|$)/i.test(value);
    if (!looksLikeAsset) return;
    const publicPath = assetUrlToPublicPath(value, baseUrl);
    if (publicPath == null) return;
    const posix = publicPath.replace(/\\/g, '/');
    if (excludeTours && posix.includes('/tours/')) return;
    out.add(posix);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringAssetPaths(item, baseUrl, out, { excludeTours });
    return;
  }
  if (value != null && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      collectStringAssetPaths(nested, baseUrl, out, { excludeTours });
    }
  }
}

async function collectNonTourSsotPaths(root, baseUrl) {
  const paths = new Set();
  const server = await createServer({
    root,
    logLevel: 'error',
    server: { middlewareMode: true },
  });
  try {
    const images = await server.ssrLoadModule('/src/constants/images.ts');
    for (const exported of Object.values(images)) {
      collectStringAssetPaths(exported, baseUrl, paths, { excludeTours: true });
    }
  } finally {
    await server.close();
  }
  return paths;
}

function walkNonTourDisk(root) {
  const disk = new Set();
  const zones = [
    'team',
    'safety',
    'banners_winter',
    'banners_spring',
    'banners_summer',
    'banners_fall',
    'cookies',
    'fonts',
  ];
  for (const zone of zones) {
    const zonePath = path.join(root, 'public', zone);
    for (const abs of walkFiles(zonePath, () => true)) {
      disk.add(path.relative(root, abs).replace(/\\/g, '/'));
    }
  }
  const publicRoot = path.join(root, 'public');
  if (fs.existsSync(publicRoot)) {
    for (const entry of fs.readdirSync(publicRoot, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (ALLOWED_EXT_RE.test(entry.name)) {
        disk.add(`public/${entry.name}`);
      }
    }
  }
  return disk;
}

function extractGeneratedPaths(generatedSource, baseUrl) {
  const paths = new Set();
  const urlRe = /"(\/[^"]*tours\/[^"]+)"/g;
  let match;
  while ((match = urlRe.exec(generatedSource)) !== null) {
    const publicPath = assetUrlToPublicPath(match[1], baseUrl);
    if (publicPath != null) paths.add(publicPath);
  }
  return paths;
}

function tourIdFromPublicPath(publicPath) {
  const normalized = publicPath.replace(/\\/g, '/');
  const m = /public\/tours\/([^/]+)\//.exec(normalized);
  return m?.[1] ?? null;
}

function fileNameFlags(fileName) {
  const flags = [];
  if (/\s/.test(fileName)) flags.push('contains_space');
  if (!ALLOWED_EXT_RE.test(fileName)) flags.push('unexpected_extension');
  if (!NAMING_OK_RE.test(fileName)) flags.push('unexpected_chars');
  if (/[A-Z]/.test(fileName)) flags.push('has_uppercase');
  return flags;
}

export async function runPublicMediaInventory({ repoRoot: root = repoRoot } = {}) {
  const { tours, baseUrl } = await loadToursViaVite();
  const catalogTourIds = new Set(tours.map((t) => t.id));

  const ssotPaths = new Set();
  const ssotByTourId = new Map();

  for (const tour of tours) {
    const tourPaths = new Set();
    for (const url of collectTourMediaUrls(tour)) {
      const publicPath = assetUrlToPublicPath(url, baseUrl);
      if (publicPath == null) continue;
      ssotPaths.add(publicPath);
      tourPaths.add(publicPath);
    }
    ssotByTourId.set(tour.id, tourPaths);
  }

  const imagesSource = fs.readFileSync(path.join(root, 'src/constants/images.ts'), 'utf8');
  for (const p of extractImagesTsTourPaths(imagesSource, baseUrl)) {
    ssotPaths.add(p);
    const tid = tourIdFromPublicPath(p);
    if (tid != null) {
      if (!ssotByTourId.has(tid)) ssotByTourId.set(tid, new Set());
      ssotByTourId.get(tid).add(p);
    }
  }

  const generatedSources = [
    'src/constants/generated/fallTourMedia.generated.ts',
    'src/constants/generated/summerPairedTourMedia.generated.ts',
  ];
  const generatedPaths = new Set();
  const generatedMissing = [];
  for (const rel of generatedSources) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    const src = fs.readFileSync(abs, 'utf8');
    for (const p of extractGeneratedPaths(src, baseUrl)) {
      generatedPaths.add(p);
      ssotPaths.add(p);
      const tid = tourIdFromPublicPath(p);
      if (tid != null) {
        if (!ssotByTourId.has(tid)) ssotByTourId.set(tid, new Set());
        ssotByTourId.get(tid).add(p);
      }
      const genPosix = p.replace(/\\/g, '/');
      if (!fs.existsSync(path.join(root, ...genPosix.split('/')))) {
        generatedMissing.push({ source: rel, path: genPosix });
      }
    }
  }

  const nonTourSsot = await collectNonTourSsotPaths(root, baseUrl);
  const nonTourDisk = walkNonTourDisk(root);
  const nonTourMissing = [];
  const nonTourOrphan = [];
  for (const p of nonTourSsot) {
    const abs = path.join(root, ...p.split('/'));
    if (!fs.existsSync(abs)) nonTourMissing.push(p);
  }
  for (const p of nonTourDisk) {
    if (!nonTourSsot.has(p) && !p.startsWith('public/fonts/')) {
      nonTourOrphan.push(p);
    }
  }

  const diskTourDirs = fs.existsSync(toursRoot)
    ? fs.readdirSync(toursRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];

  const diskTourIds = new Set(diskTourDirs);
  const orphanDirs = diskTourDirs.filter((id) => !catalogTourIds.has(id));

  const diskMediaFiles = walkFiles(toursRoot, (abs) => MEDIA_EXT_RE.test(abs));
  const diskPathSet = new Set(
    diskMediaFiles.map((abs) => path.relative(root, abs).replace(/\\/g, '/'))
  );
  const diskByTour = new Map();
  for (const abs of diskMediaFiles) {
    const rel = path.relative(root, abs).replace(/\\/g, '/');
    const tid = tourIdFromPublicPath(rel);
    if (tid == null) continue;
    if (!diskByTour.has(tid)) diskByTour.set(tid, new Set());
    diskByTour.get(tid).add(rel);
  }

  const ssotPosixSet = new Set([...ssotPaths].map((p) => p.replace(/\\/g, '/')));

  const missing = [];
  for (const normalized of ssotPosixSet) {
    if (!normalized.startsWith('public/tours/')) continue;
    const abs = path.join(root, ...normalized.split('/'));
    if (!fs.existsSync(abs)) {
      missing.push({
        path: normalized,
        tourId: tourIdFromPublicPath(normalized),
      });
    }
  }

  const orphanFiles = [];
  for (const posix of diskPathSet) {
    if (!ssotPosixSet.has(posix)) orphanFiles.push(posix);
  }

  const namingFlags = [];
  for (const abs of diskMediaFiles) {
    const base = path.basename(abs);
    const flags = fileNameFlags(base);
    if (flags.length > 0) {
      namingFlags.push({
        path: path.relative(root, abs).replace(/\\/g, '/'),
        flags,
      });
    }
  }

  const tourJournal = [];
  for (const tourId of [...catalogTourIds].sort()) {
    const expected = ssotByTourId.get(tourId) ?? new Set();
    const onDisk = diskByTour.get(tourId) ?? new Set();
    const missingForTour = [...expected].filter((p) => {
      const posix = p.replace(/\\/g, '/');
      return !fs.existsSync(path.join(root, ...posix.split('/')));
    });
    let status = 'OK';
    if (!diskTourIds.has(tourId)) status = 'no_folder';
    else if (missingForTour.length > 0) status = 'missing_files';
    tourJournal.push({
      tourId,
      status,
      filesOnDisk: onDisk.size,
      ssotPaths: expected.size,
      missingCount: missingForTour.length,
      missingSample: missingForTour.slice(0, 8).map((p) => p.replace(/\\/g, '/')),
      orphanFileCount: [...onDisk].filter(
        (f) => ![...expected].some((e) => e.replace(/\\/g, '/') === f)
      ).length,
    });
  }

  const fontsDir = path.join(root, 'public', 'fonts');
  const fontsOnDisk = walkFiles(fontsDir, () => true).map((abs) =>
    path.relative(root, abs).replace(/\\/g, '/')
  );

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    summary: {
      catalogTourCount: catalogTourIds.size,
      diskTourDirCount: diskTourDirs.length,
      diskMediaFileCount: diskMediaFiles.length,
      ssotTourPathCount: [...ssotPaths].filter((p) => p.replace(/\\/g, '/').startsWith('public/tours/')).length,
      missingCount: missing.length,
      orphanDirCount: orphanDirs.length,
      orphanFileCount: orphanFiles.length,
      namingFlagCount: namingFlags.length,
      generatedMissingCount: generatedMissing.length,
      nonTourSsotCount: nonTourSsot.size,
      nonTourMissingCount: nonTourMissing.length,
      nonTourOrphanCount: nonTourOrphan.length,
      nonTourDiskCount: nonTourDisk.size,
      toursOk: tourJournal.filter((t) => t.status === 'OK').length,
      toursNoFolder: tourJournal.filter((t) => t.status === 'no_folder').length,
      toursMissingFiles: tourJournal.filter((t) => t.status === 'missing_files').length,
    },
    orphanDirs,
    missing,
    orphanFiles: orphanFiles.slice(0, 500),
    namingFlags: namingFlags.slice(0, 100),
    generatedMissing: generatedMissing.slice(0, 50),
    nonTour: {
      ssotPaths: [...nonTourSsot].sort(),
      missing: nonTourMissing,
      orphan: nonTourOrphan.slice(0, 100),
      diskFileCount: nonTourDisk.size,
      fontsAppOnly: fontsOnDisk,
    },
    s3ScopeNote:
      'Mirror public/ except public/fonts/ (App-only per Phase 1). Include tours, team, safety, banners_*, root SVG/webp.',
    tourJournal,
  };

  return report;
}

async function main() {
  const writeJson = process.argv.includes('--json');
  const report = await runPublicMediaInventory();

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const { summary } = report;
  console.log('Public media inventory (Phase 2)');
  console.log(`  Catalog tours: ${summary.catalogTourCount}`);
  console.log(`  Disk tour dirs: ${summary.diskTourDirCount}`);
  console.log(`  Disk media files: ${summary.diskMediaFileCount}`);
  console.log(`  Tours OK: ${summary.toursOk} | no_folder: ${summary.toursNoFolder} | missing_files: ${summary.toursMissingFiles}`);
  console.log(`  SSOT missing on disk: ${summary.missingCount}`);
  console.log(`  Orphan dirs: ${summary.orphanDirCount}${summary.orphanDirCount ? ` (${report.orphanDirs.join(', ')})` : ''}`);
  console.log(`  Orphan files (not in SSOT): ${summary.orphanFileCount}`);
  console.log(`  Naming flags: ${summary.namingFlagCount}`);
  console.log(`  Generated paths missing: ${summary.generatedMissingCount}`);
  console.log(`  Non-tour disk files: ${summary.nonTourDiskCount} | SSOT missing: ${summary.nonTourMissingCount} | orphan: ${summary.nonTourOrphanCount}`);
  console.log(`  JSON: ${path.relative(repoRoot, outJson)}`);

  if (summary.missingCount > 0) {
    console.log('\nMissing (sample):');
    for (const item of report.missing.slice(0, 15)) {
      console.log(`  - ${item.path}${item.tourId ? ` (${item.tourId})` : ''}`);
    }
  }

  if (writeJson) {
    console.log(JSON.stringify(report.summary, null, 2));
  }

  if (summary.missingCount > 0 && summary.toursMissingFiles > 0) {
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isCli) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
