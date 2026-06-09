import { execFile } from 'node:child_process';
import { unlink } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { promisify } from 'node:util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

export const OG_SHELL_IMAGE_WIDTH = 1200 as const;
export const OG_SHELL_IMAGE_HEIGHT = 630 as const;

const OG_JPEG_QUALITY = '2';
const OG_FFMPEG_SCALE_FILTER = `scale=${OG_SHELL_IMAGE_WIDTH}:${OG_SHELL_IMAGE_HEIGHT}:force_original_aspect_ratio=increase,crop=${OG_SHELL_IMAGE_WIDTH}:${OG_SHELL_IMAGE_HEIGHT}`;

const RASTER_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg']);

const toJpegLogicalPath = (logicalPath: string): string =>
  logicalPath.replace(/\.(webp|png|jpe?g)$/i, '.jpg');

/** Telegram OG previews: JPEG 1200×630 on App domain. */
export async function ensureTelegramFriendlyOgImage(
  distDir: string,
  logicalPath: string,
): Promise<string> {
  const extension = extname(logicalPath).toLowerCase();
  if (!RASTER_EXTENSIONS.has(extension)) {
    return logicalPath;
  }

  const jpegLogical = toJpegLogicalPath(logicalPath);
  const sourcePath = resolve(distDir, logicalPath);
  const jpegPath = resolve(distDir, jpegLogical);

  if (!ffmpegStatic) {
    process.stdout.write(
      `[og-asset] warn: ffmpeg-static missing, keeping ${logicalPath} for Telegram\n`,
    );
    return logicalPath;
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
    process.stdout.write(
      `[og-asset] warn: jpeg conversion failed for ${logicalPath} (${error instanceof Error ? error.message : String(error)}), keeping source\n`,
    );
    return logicalPath;
  }
}

export const isJpegOgImagePath = (logicalPath: string): boolean =>
  /\.jpe?g$/i.test(logicalPath);

/** Probe JPEG dimensions via ffmpeg stderr (no ffprobe dependency). */
export async function probeJpegDimensions(
  filePath: string,
): Promise<{ width: number; height: number } | null> {
  if (!ffmpegStatic) {
    return null;
  }

  try {
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
