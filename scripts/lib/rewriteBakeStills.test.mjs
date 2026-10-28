import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { rewriteBakeStills } from './rewriteBakeStills.mjs';

describe('rewriteBakeStills', () => {
  it('copies cover/preface from previous bake and rewrites stillUrl to same-origin', async () => {
    const root = await mkdtemp(resolve(tmpdir(), 'vkr-stills-'));
    const prev = resolve(root, 'public/data/cms/media/tours/fall-1/cover.webp');
    await mkdir(resolve(root, 'public/data/cms/media/tours/fall-1'), { recursive: true });
    await writeFile(prev, Buffer.from([1, 2, 3]));
    const tours = {
      schemaVersion: 1,
      tours: [{
        id: 'fall-1',
        coverAssetId: 'cover',
        prefaceAssetId: 'preface',
        assets: [
          { id: 'cover', stillUrl: 'https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-1/cover.webp', videoUrl: null, alt: '' },
          { id: 'preface', stillUrl: 'https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-1/preface.webp', videoUrl: null, alt: '' },
          { id: 'g-0', stillUrl: 'https://ypnmfvotln.cdn.twcstorage.ru/media/tours/fall-1/g-0.webp', videoUrl: null, alt: '' },
        ],
      }],
    };
    try {
      const next = await rewriteBakeStills({
        root,
        tours,
        fetchImpl: async () => ({ ok: false, status: 403, arrayBuffer: async () => new ArrayBuffer(0) }),
      });
      expect(next.tours[0].assets[0].stillUrl).toBe('/data/cms/media/tours/fall-1/cover.webp');
      expect(next.tours[0].assets[2].stillUrl).toContain('cdn.twcstorage.ru');
      expect(await readFile(prev)).toEqual(Buffer.from([1, 2, 3]));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
