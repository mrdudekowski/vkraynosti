import path from 'node:path';

const BYTES_IN_MIB = 1024 * 1024;
const BYTES_IN_KIB = 1024;

export const MEDIA_BUDGET_LIMITS = {
  gridVideo: { warnBytes: 6 * BYTES_IN_MIB, failBytes: 10 * BYTES_IN_MIB },
  // MP4 viewer assets only; plain *.webm is legacy / not produced by encode scripts.
  viewerVideo: { warnBytes: 15 * BYTES_IN_MIB, failBytes: 40 * BYTES_IN_MIB },
  posterImage: { warnBytes: 300 * BYTES_IN_KIB, failBytes: 500 * BYTES_IN_KIB },
  /** Tour card / hero mobile covers: `{name}.mobile.webp` (not poster slots). */
  coverMobile: { warnBytes: 200 * BYTES_IN_KIB, failBytes: 350 * BYTES_IN_KIB },
  heroOrViewerImage: { warnBytes: 2 * BYTES_IN_MIB, failBytes: Number.POSITIVE_INFINITY },
  other: { warnBytes: Number.POSITIVE_INFINITY, failBytes: Number.POSITIVE_INFINITY },
};

export const MEDIA_EXT_RE = /\.(webm|mp4|webp|png|jpe?g)$/i;

export function classifyPublicTourMediaPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const fileName = path.posix.basename(normalizedPath).toLowerCase();

  if (fileName.endsWith('.grid.webm')) return 'gridVideo';
  // Plain *.webm (non-grid) is legacy / unexpected in tours; budget as uncategorized.
  if (fileName.endsWith('.webm')) return 'other';
  if (fileName.endsWith('.mp4')) return 'viewerVideo';
  if (/\.poster(?:\.mobile)?\.webp$/.test(fileName)) return 'posterImage';
  if (/\.mobile\.webp$/.test(fileName)) return 'coverMobile';
  if (/\.(webp|png|jpe?g)$/i.test(fileName)) return 'heroOrViewerImage';
  return 'other';
}

export function formatBytes(bytes) {
  if (bytes >= BYTES_IN_MIB) return `${(bytes / BYTES_IN_MIB).toFixed(2)} MiB`;
  return `${(bytes / BYTES_IN_KIB).toFixed(1)} KiB`;
}
