import { describe, expect, it } from 'vitest';
import type { CmsTourDocument } from './cmsTourDocument';
import { collectCmsMigrationMedia, dedupeCmsMigrationMedia } from './collectCmsMigrationMedia';

const publicBase = 'https://s3.twcstorage.ru/vkraynosti-cms-dev';

function doc(id: string, still: string, video: string | null = null): CmsTourDocument {
  return {
    id,
    slug: id,
    season: 'winter',
    status: 'active',
    title: id,
    subtitle: '',
    heroPhrase: '',
    description: '',
    duration: '1 день',
    difficulty: 'Medium',
    price: '0',
    program: [],
    included: [],
    coverAssetId: 'cover',
    prefaceAssetId: null,
    assets: [{ id: 'cover', stillUrl: still, videoUrl: video, alt: id }],
    bento: { blocks: [] },
    legacyGalleryVariant: null,
  };
}

describe('collectCmsMigrationMedia', () => {
  it('maps original asset urls to rewritten cms media keys', () => {
    const original = doc('winter-1', '/vkraynosti/tours/winter-1/hero.webp');
    const rewritten = doc(
      'winter-1',
      `${publicBase}/media/tours/winter-1/hero.webp`
    );
    expect(collectCmsMigrationMedia(original, rewritten, publicBase)).toEqual([
      {
        sourceUrl: '/vkraynosti/tours/winter-1/hero.webp',
        key: 'media/tours/winter-1/hero.webp',
      },
    ]);
  });

  it('dedupes repeated source/key pairs', () => {
    const rows = dedupeCmsMigrationMedia([
      { sourceUrl: '/tours/a.webp', key: 'media/tours/winter-1/a.webp' },
      { sourceUrl: '/tours/a.webp', key: 'media/tours/winter-1/a.webp' },
    ]);
    expect(rows).toHaveLength(1);
  });
});
