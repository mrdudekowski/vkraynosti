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

  const jpegLogical = toJpegLogicalPath(logicalPath);
  const sourcePath = resolve(distDir, logicalPath);
  const jpegPath = resolve(distDir, jpegLogical);

  const useFallback = async (): Promise<string> => {
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
    const fallback = await useFallback();
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
    const fallback = await useFallback();
    process.stdout.write(
      `[og-asset] ${fallback === logicalPath ? 'warn: jpeg conversion failed, keeping source' : 'fallback: jpeg conversion failed, using'} ${fallback} (${error instanceof Error ? error.message : String(error)})\n`,
    );
    return fallback;
  }
}

export const isJpegOgImagePath = (logicalPath: string): boolean =>
  /\.jpe?g$/i.test(logicalPath);

const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

/** Probe JPEG dimensions from the frame header without external binaries. */
export async function probeJpegDimensions(
  filePath: string,
): Promise<{ width: number; height: number } | null> {
  try {
    const bytes = await readFile(filePath);
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
      return null;
    }

    let offset = 2;
    while (offset + 3 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      while (bytes[offset] === 0xff) offset += 1;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker >= 0xd0 && marker <= 0xd7) continue;
      const segmentLength = bytes.readUInt16BE(offset);
      if (JPEG_SOF_MARKERS.has(marker)) {
        return {
          height: bytes.readUInt16BE(offset + 3),
          width: bytes.readUInt16BE(offset + 5),
        };
      }
      offset += segmentLength;
    }
    return null;
  } catch {
    return null;
  }
}
