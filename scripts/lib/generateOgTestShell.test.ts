import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { generateStaticOgTestPage } from './generateOgTestShell.ts';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('generateStaticOgTestPage', () => {
  it('writes the resolved fallback image path into OG metadata', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'vkraynosti-og-root-'));
    const distDir = await mkdtemp(join(tmpdir(), 'vkraynosti-og-dist-'));
    tempDirectories.push(rootDir, distDir);
    await mkdir(join(rootDir, 'public', 'banners_summer'), { recursive: true });
    await writeFile(join(rootDir, 'public', 'banners_summer', 'Summer.webp'), 'webp-source');
    await writeFile(join(distDir, 'og-cover-prod.jpg'), Buffer.from([0xff, 0xd8, 0xff, 0xd9]));

    await generateStaticOgTestPage(distDir, rootDir, {
      route: '/og-test',
      distDirName: 'og-test',
      imageLogical: 'og-test/cover.jpg',
      sourceLogical: 'og-test/cover.webp',
      title: 'OG Test',
      description: 'OG test page',
      bodyText: 'OG Test',
    });

    const html = await readFile(join(distDir, 'og-test', 'index.html'), 'utf8');
    expect(html).toContain('og-cover-prod.jpg');
  });
});
