import { describe, expect, it } from 'vitest';
import { cmsPublishBlockers } from './cmsPublishRules';
import { UNSET_INCLUDED_ICON_KEY } from './includedIconCatalog';
import type { CmsTourDocument } from './cmsTourDocument';

const base: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'active',
  title: 'Изюбриная',
  subtitle: '',
  heroPhrase: '',
  description: '',
  duration: '',
  difficulty: 'Medium',
  price: '',
  program: [],
  included: [],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    { id: 'cover', stillUrl: 'https://cdn.example/cover.webp', videoUrl: null, alt: '' },
    { id: 'preface', stillUrl: 'https://cdn.example/preface.webp', videoUrl: null, alt: '' },
    { id: 'g-0', stillUrl: 'https://cdn.example/g-0.webp', videoUrl: null, alt: '' },
  ],
  bento: { blocks: [{ type: 'bento-single', slots: [{ assetId: 'g-0' }] }] },
  legacyGalleryVariant: null,
};

describe('cmsPublishBlockers', () => {
  it('пустой список, если обложка есть и пул разобран', () => {
    expect(cmsPublishBlockers(base)).toEqual([]);
  });

  it('требует обложку и пустой пул', () => {
    expect(cmsPublishBlockers({ ...base, coverAssetId: null })).toContain('cover_required');
    expect(cmsPublishBlockers({ ...base, bento: { blocks: [] } })).toEqual(['pool_not_empty']);
  });

  it('блокирует пустые ячейки сетки', () => {
    expect(
      cmsPublishBlockers({
        ...base,
        bento: {
          blocks: [{ type: 'bento-vert', slots: [{ assetId: 'g-0' }, { assetId: null }] }],
        },
      }),
    ).toEqual(['bento_empty_slots']);
  });

  it('блокирует пункт с текстом без иконки каталога', () => {
    expect(
      cmsPublishBlockers({
        ...base,
        included: [{ text: 'Трансфер', iconKey: UNSET_INCLUDED_ICON_KEY }],
      }),
    ).toEqual(['included_icon_required']);
    expect(
      cmsPublishBlockers({
        ...base,
        included: [{ text: '  ', iconKey: UNSET_INCLUDED_ICON_KEY }],
      }),
    ).toEqual([]);
  });
});
