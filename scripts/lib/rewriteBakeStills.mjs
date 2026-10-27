import { access, constants, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

function objectKeyFromPublicUrl(tourId, url) {
  const expectedPrefix = `/media/tours/${tourId}/`;
  try {
    const pathname = new URL(url).pathname;
    const start = pathname.indexOf('/media/tours/');
    if (start === -1) {
      return null;
    }
    const rest = pathname.slice(start);
    if (!rest.startsWith(expectedPrefix)) {
      return null;
    }
    const fileName = rest.slice(expectedPrefix.length);
    if (!fileName || fileName.includes('/')) {
      return null;
    }
    return `media/tours/${tourId}/${fileName}`;
  } catch {
    return null;
  }
}

function bakePathFromKey(key) {
  return `/data/cms/${key}`;
}

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureCopied({ root, key, sourceUrl, fetchImpl }) {
  const dest = resolve(root, 'public/data/cms', key);
  if (await fileExists(dest)) {
    return true;
  }
  try {
    await mkdir(dirname(dest), { recursive: true });
    const response = await fetchImpl(sourceUrl, { cache: 'no-store' });
    if (!response.ok) {
      return false;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) {
      return false;
    }
    await writeFile(dest, bytes);
    return true;
  } catch {
    return false;
  }
}

function rewriteAsset(asset, tourId, copiedKeys) {
  if (asset == null || typeof asset.stillUrl !== 'string') {
    return asset;
  }
  const key = objectKeyFromPublicUrl(tourId, asset.stillUrl);
  if (key == null || !copiedKeys.has(key)) {
    return asset;
  }
  return { ...asset, stillUrl: bakePathFromKey(key) };
}

export async function rewriteBakeStills({
  root,
  tours,
  fetchImpl = fetch,
} = {}) {
  const nextTours = structuredClone(tours);
  const copiedKeys = new Set();
  for (const tour of nextTours.tours ?? []) {
    if (tour == null || typeof tour.id !== 'string') {
      continue;
    }
    const reserved = [tour.coverAssetId, tour.prefaceAssetId].filter(
      (id) => typeof id === 'string' && id.length > 0,
    );
    for (const asset of tour.assets ?? []) {
      if (!reserved.includes(asset.id)) {
        continue;
      }
      const key = objectKeyFromPublicUrl(tour.id, asset.stillUrl);
      if (key == null) {
        continue;
      }
      if (await ensureCopied({ root, key, sourceUrl: asset.stillUrl, fetchImpl })) {
        copiedKeys.add(key);
      }
    }
    tour.assets = (tour.assets ?? []).map((asset) => rewriteAsset(asset, tour.id, copiedKeys));
  }
  return nextTours;
}
