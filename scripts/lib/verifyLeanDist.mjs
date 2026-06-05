import fs from 'node:fs';
import path from 'node:path';

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

/**
 * After CDN prune + prerender, dist/tours may contain only index.html shells.
 * Fails if any tour media files remain in dist/tours.
 */
export function verifyLeanDistTours(distDir) {
  const toursDir = path.join(distDir, 'tours');
  if (!fs.existsSync(toursDir)) {
    return { ok: true, violations: [] };
  }

  const violations = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolute);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (FORBIDDEN_MEDIA_EXTENSIONS.has(ext)) {
        violations.push(path.relative(distDir, absolute));
      }
    }
  };

  walk(toursDir);
  return { ok: violations.length === 0, violations };
}
