import { execFile } from 'node:child_process';
import { readFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { promisify } from 'node:util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

export const OG_SHELL_IMAGE_WIDTH = 1200 as const;
export const OG_SHELL_IMAGE_HEIGHT = 630 as const;
export const OG_FALLBACK_JPEG_LOGICAL = 'og-cover-prod.jpg' as const;

const OG_JPEG_QUALITY = '2';
const OG_FFMPEG_SCALE_FILTER = `scale=${OG_SHELL_IMAGE_WIDTH}:${OG_SHELL_IMAGE_HEIGHT}:force_original_aspect_ratio=increase,crop=${OG_SHELL_IMAGE_WIDTH}:${OG_SHELL_IMAGE_HEIGHT}`;

const RASTER_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg']);

const toJpegLogicalPath = (logicalPath: string): string =>
  logicalPath.replace(/\.(webp|png|jpe?g)$/i, '.jpg');

/** Telegram OG previews: JPEG 1200×630 on App domain. */
export async function ensureTelegramFriendlyOgImage(
  distDir: string,
  logicalPath: string,
  fallbackLogicalPath: string = OG_FALLBACK_JPEG_LOGICAL,
): Promise<string> {
  const extension = extname(logicalPath).toLowerCase();
  if (!RASTER_EXTENSIONS.has(extension)) {
    return logicalPath;
  }

  // JPGs uploaded as OG assets are already in the crawler-friendly format.
  // Do not invoke ffmpeg for them; this keeps static builds independent of
  // whether the optional ffmpeg binary was installed in the build container.
  if (extension === '.jpg' || extension === '.jpeg') {
    return logicalPath;
  }

  const jpegLogical = toJpegLogicalPath(logicalPath);
  const sourcePath = resolve(distDir, logicalPath);
  const jpegPath = resolve(distDir, jpegLogical);

  const resolveFallbackImage = async (): Promise<string> => {
    const fallbackPath = resolve(distDir, fallbackLogicalPath);
    if (!existsSync(fallbackPath)) {
      return logicalPath;
    }
    if (sourcePath !== fallbackPath) {
      await unlink(sourcePath).catch(() => {});
    }
    return fallbackLogicalPath;
  };

  if (!ffmpegStatic) {
    const fallback = await resolveFallbackImage();
    process.stdout.write(
      `[og-asset] ${fallback === logicalPath ? 'warn: ffmpeg-static missing, keeping' : 'fallback: ffmpeg-static missing, using'} ${fallback}\n`,
    );
    return fallback;
  }

  try {
    await execFileAsync(
      ffmpegStatic,
      [
        '-y',
        '-i',
        sourcePath,
        '-vf',
        OG_FFMPEG_SCALE_FILTER,
        '-q:v',
        OG_JPEG_QUALITY,
        jpegPath,
      ],
      { maxBuffer: 10 * 1024 * 1024 },
    );

    if (jpegPath !== sourcePath) {
      await unlink(sourcePath);
    }

    process.stdout.write(`[og-asset] jpeg ${jpegLogical} (${OG_SHELL_IMAGE_WIDTH}x${OG_SHELL_IMAGE_HEIGHT})\n`);
    return jpegLogical;
  } catch (error) {
    const fallback = await resolveFallbackImage();
    process.stdout.write(
      `[og-asset] ${fallback === logicalPath ? 'warn: jpeg conversion failed, keeping source' : 'fallback: jpeg conversion failed, using'} ${fallback} (${error instanceof Error ? error.message : String(error)})\n`,
    );
    return fallback;
  }
}

export const isJpegOgImagePath = (logicalPath: string): boolean =>
  /\.jpe?g$/i.test(logicalPath);

/** Probe JPEG dimensions via ffmpeg stderr (no ffprobe dependency). */
export async function probeJpegDimensions(
  filePath: string,
): Promise<{ width: number; height: number } | null> {
  const bytes = await readFile(filePath);
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  const sofMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset++];
    if (marker === undefined) return null;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      continue;
    }
    if (offset + 1 >= bytes.length) return null;
    const segmentLength = bytes.readUInt16BE(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) return null;
    if (sofMarkers.has(marker) && segmentLength >= 7) {
      return {
        height: bytes.readUInt16BE(offset + 3),
        width: bytes.readUInt16BE(offset + 5),
      };
    }
    offset += segmentLength;
  }

  try {
    if (!ffmpegStatic) return null;
    await execFileAsync(ffmpegStatic, ['-hide_banner', '-i', filePath], {
      maxBuffer: 1024 * 1024,
    });
    return null;
  } catch (error) {
    const stderr =
      error != null &&
      typeof error === 'object' &&
      'stderr' in error &&
      typeof error.stderr === 'string'
        ? error.stderr
        : '';
    const match = stderr.match(/,\s*(\d{2,5})x(\d{2,5})(?:\s|,|\[)/);
    if (!match) {
      return null;
    }
    return { width: Number(match[1]), height: Number(match[2]) };
  }
}
