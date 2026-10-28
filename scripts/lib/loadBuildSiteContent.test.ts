/** @vitest-environment node */
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createDefaultSiteSeoDocument } from '../../src/cms/siteSeoDocument.ts';
import { loadBuildPublishedSiteContent } from './loadBuildSiteContent.ts';

describe('loadBuildPublishedSiteContent', () => {
  let rootDir = '';

  afterEach(async () => {
    if (rootDir.length > 0) {
      await rm(rootDir, { recursive: true, force: true });
      rootDir = '';
    }
  });

  it('reads baked SEO JSON from public/ without fetch', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'cms-seo-bake-'));
    const dest = join(rootDir, 'public/data/cms/site-seo');
    await mkdir(dest, { recursive: true });
    const document = createDefaultSiteSeoDocument();
    await writeFile(join(dest, 'document.json'), `${JSON.stringify(document)}\n`, 'utf8');

    await expect(loadBuildPublishedSiteContent('seo', rootDir)).resolves.toEqual(document);
  });

  it('returns null when the bake file is missing', async () => {
    rootDir = await mkdtemp(join(tmpdir(), 'cms-seo-missing-'));
    await expect(loadBuildPublishedSiteContent('seo', rootDir)).resolves.toBeNull();
  });
});
