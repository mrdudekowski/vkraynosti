import { execFile } from 'node:child_process';
import { unlink } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { promisify } from 'node:util';
import ffmpegStatic from 'ffmpeg-static';

const execFileAsync = promisify(execFile);

const TELEGRAM_CONVERT_EXTENSIONS = new Set(['.webp', '.png']);

/** Telegram reliably renders JPEG; WebP/PNG previews are inconsistent across clients. */
export async function ensureTelegramFriendlyOgImage(
  distDir: string,
  logicalPath: string,
): Promise<string> {
  const extension = extname(logicalPath).toLowerCase();
  if (!TELEGRAM_CONVERT_EXTENSIONS.has(extension)) {
    return logicalPath;
  }

  const jpegLogical = logicalPath.replace(/\.(webp|png)$/i, '.jpg');
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
      ['-y', '-i', sourcePath, '-q:v', '2', jpegPath],
      { maxBuffer: 10 * 1024 * 1024 },
    );
    await unlink(sourcePath);
    process.stdout.write(`[og-asset] jpeg ${jpegLogical} for Telegram\n`);
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
