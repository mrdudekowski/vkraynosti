import { mkdir, writeFile } from 'node:fs/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ensureTelegramFriendlyOgImage, probeJpegDimensions } from './ogShellTelegramImage.ts';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('ensureTelegramFriendlyOgImage', () => {
  it('uses a supplied JPEG fallback when ffmpeg conversion is unavailable', async () => {
    const distDir = await mkdtemp(join(tmpdir(), 'vkraynosti-og-'));
    tempDirectories.push(distDir);
    await mkdir(join(distDir, 'tours'), { recursive: true });
    await writeFile(join(distDir, 'tours', 'summer-1.webp'), 'webp-source');
    await writeFile(join(distDir, 'og-cover-prod.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));

    const resolved = await ensureTelegramFriendlyOgImage(
      distDir,
      'tours/summer-1.webp',
      'og-cover-prod.jpg',
    );

    expect(resolved).toBe('og-cover-prod.jpg');
  });

  it('probes dimensions from the JPEG bytes without ffmpeg', async () => {
    const dimensions = await probeJpegDimensions(join(process.cwd(), 'og-cover-prod.jpg'));

    expect(dimensions).toEqual({ width: 1200, height: 630 });
  });
});
