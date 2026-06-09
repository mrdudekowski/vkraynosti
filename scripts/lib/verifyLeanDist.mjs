import fs from 'node:fs';
import path from 'node:path';

const OG_SHELL_ASSET_MANIFEST = '.og-shell-assets.json';

const FORBIDDEN_MEDIA_EXTENSIONS = new Set([
  '.webp',
  '.webm',
  '.mp4',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.avif',
]);

function normalizeRelativePath(relativePath) {
  return relativePath.replace(/\\/g, '/');
}

function loadOgShellAssetAllowlist(distDir) {
  const manifestPath = path.join(distDir, OG_SHELL_ASSET_MANIFEST);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!Array.isArray(parsed.allowedRelativePaths)) {
      return null;
    }
    return new Set(
      parsed.allowedRelativePaths
        .filter((entry) => typeof entry === 'string')
        .map(normalizeRelativePath),
    );
  } catch {
    return null;
  }
}

/**
 * After CDN prune + OG shells, dist/tours may contain index.html and allowlisted OG images only.
 * Fails if any other tour media files remain in dist/tours.
 */
export function verifyLeanDistTours(distDir) {
  const toursDir = path.join(distDir, 'tours');
  if (!fs.existsSync(toursDir)) {
    return { ok: true, violations: [] };
  }

  const allowlist = loadOgShellAssetAllowlist(distDir);
  const violations = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (!FORBIDDEN_MEDIA_EXTENSIONS.has(ext)) {
        continue;
      }
      const relative = normalizeRelativePath(path.relative(distDir, absolute));
      if (allowlist?.has(relative)) {
        continue;
      }
      violations.push(relative);
    }
  };

  walk(toursDir);
  return { ok: violations.length === 0, violations };
}
