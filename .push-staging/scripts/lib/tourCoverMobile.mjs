import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { MEDIA_BUDGET_LIMITS } from '../public-media-budget-core.mjs';

export const COVER_BASENAMES = ['hero.webp', 'cover.webp'];

export const MOBILE_COVER_MAX_LONG_SIDE = 640;

export const MOBILE_COVER_QUALITY_STEPS = [58, 50, 42];

export const MOBILE_COVER_TARGET_MAX_BYTES = 200 * 1024;

export const MOBILE_COVER_FAIL_MAX_BYTES =
  MEDIA_BUDGET_LIMITS.coverMobile?.failBytes ?? 350 * 1024;

const VIDEO_URL_RE = /\.(webm|mp4|mov)(\?|#|$)/i;

/** Mirrors `tourCoverMobileVariantUrl` in src/utils/tourCoverMobileVariant.ts */
export function desktopCoverToMobilePath(desktopUrl) {
  return desktopUrl.replace(/\.webp$/i, '.mobile.webp');
}

/**
 * `/vkraynosti/tours/spring-3/hero.webp` → `{repoRoot}/public/tours/spring-3/hero.webp`
 */
export function resolvePublicFilePath(assetUrl, repoRoot, baseUrl = '/vkraynosti/') {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (!assetUrl.startsWith(normalizedBase)) {
    throw new Error(`Asset URL must start with base "${normalizedBase}": ${assetUrl}`);
  }
  const relativeFromPublic = assetUrl.slice(normalizedBase.length);
  return path.join(repoRoot, 'public', relativeFromPublic);
}

/**
 * Desktop cover from catalog URL; if file missing, try hero.webp / cover.webp in same tour folder.
 */
export function resolveDesktopCoverOnDisk(desktopUrl, repoRoot, baseUrl = '/vkraynosti/') {
  const primaryPath = resolvePublicFilePath(desktopUrl, repoRoot, baseUrl);
  if (fs.existsSync(primaryPath)) {
    return { filePath: primaryPath, catalogUrl: desktopUrl };
  }

  const tourDir = path.dirname(primaryPath);
  for (const basename of COVER_BASENAMES) {
    const candidatePath = path.join(tourDir, basename);
    if (fs.existsSync(candidatePath)) {
      return {
        filePath: candidatePath,
        catalogUrl: desktopUrl.replace(/[^/]+\.webp$/i, basename),
      };
    }
  }

  return null;
}

export function isTourCoverWebpUrl(url) {
  return url.includes('/tours/') && /\.webp(\?|#|$)/i.test(url) && !VIDEO_URL_RE.test(url);
}

function scaleExpr(maxLong) {
  return `scale='if(gt(ih,iw),-2,min(${maxLong},iw))':'if(gt(ih,iw),min(${maxLong},ih),-2)'`;
}

function runFfmpeg(args) {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not found');
  }
  const res = spawnSync(ffmpegPath, args, { stdio: 'pipe' });
  if (res.status !== 0) {
    throw new Error(`ffmpeg failed: ${Buffer.from(res.stderr || '').toString()}`);
  }
}

export function encodeMobileCoverWebp(
  inputPath,
  outputPath,
  {
    maxLongSide = MOBILE_COVER_MAX_LONG_SIDE,
    targetMaxBytes = MOBILE_COVER_TARGET_MAX_BYTES,
    failMaxBytes = MOBILE_COVER_FAIL_MAX_BYTES,
    qualitySteps = MOBILE_COVER_QUALITY_STEPS,
  } = {}
) {
  const tempPath = `${outputPath}.tmp.webp`;
  let bestSize = Number.POSITIVE_INFINITY;
  let bestQuality = null;

  for (const quality of qualitySteps) {
    runFfmpeg([
      '-y',
      '-i',
      inputPath,
      '-vf',
      scaleExpr(maxLongSide),
      '-c:v',
      'libwebp',
      '-quality',
      String(quality),
      '-compression_level',
      '6',
      '-preset',
      'picture',
      tempPath,
    ]);
    const size = fs.statSync(tempPath).size;
    if (size < bestSize) {
      bestSize = size;
      bestQuality = quality;
    }
    if (size <= targetMaxBytes) break;
  }

  if (bestQuality == null || !fs.existsSync(tempPath)) {
    throw new Error(`Failed to encode mobile cover: ${inputPath}`);
  }

  if (bestSize > failMaxBytes) {
    fs.unlinkSync(tempPath);
    throw new Error(
      `Mobile cover exceeds fail budget (${bestSize} > ${failMaxBytes} bytes): ${outputPath}`
    );
  }

  fs.renameSync(tempPath, outputPath);
  return { outputPath, sizeBytes: bestSize, quality: bestQuality };
}

export function formatKiB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}
