/** @vitest-environment node */
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createFilesystemJsonStore } from './store.ts';

describe('createFilesystemJsonStore', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir.length > 0) {
      await rm(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('reads and writes nested json keys', async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'cms-store-'));
    const store = createFilesystemJsonStore(tempDir);
    await store.putJson('draft/tours/winter-1/document.json', { id: 'winter-1' });
    await expect(store.getJson('draft/tours/winter-1/document.json')).resolves.toEqual({
      id: 'winter-1',
    });
    const filePath = path.join(tempDir, 'draft', 'tours', 'winter-1', 'document.json');
    await expect(readFile(filePath, 'utf8')).resolves.toContain('winter-1');
  });
});
