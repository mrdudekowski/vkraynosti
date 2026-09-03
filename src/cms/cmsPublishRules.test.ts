import { describe, expect, it } from 'vitest';
import { cmsPublishBlockers, cmsPublishBlockersForIntent } from './cmsPublishRules';
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

const ready: CmsTourDocument = {
  ...base,
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'лево',
  descriptionAside: 'право',
  duration: '1 день',
  durationDays: 1,
  price: 'по запросу',
    program: [{ day: 1, timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
};

describe('cmsPublishBlockers', () => {
  it('пустой список, если обложка есть и пул разобран', () => {
    expect(cmsPublishBlockers(ready)).toEqual([]);
  });

  it('blocks publish when the tour is not ready', () => {
    expect(cmsPublishBlockers(base)).toContain('tour_not_ready');
  });

  it('keeps legacy blocker codes aligned with the detailed readiness result', () => {
    expect(cmsPublishBlockers({ ...ready, description: '', program: [] })).toEqual([
      'tour_not_ready',
    ]);
  });

  it('требует обложку и заполненную сетку, пул не блокирует', () => {
    expect(cmsPublishBlockers({ ...ready, coverAssetId: null })).toContain('cover_required');
    expect(cmsPublishBlockers({ ...ready, bento: { blocks: [] } })).toContain('bento_empty_slots');
    expect(cmsPublishBlockers(ready)).not.toContain('pool_not_empty');
  });

  it('не блокирует свободные кадры в пуле', () => {
    expect(
      cmsPublishBlockers({
        ...ready,
        assets: [
          ...ready.assets,
          { id: 'extra', stillUrl: 'https://cdn.example/extra.webp', videoUrl: null, alt: 'Изюбриная' },
        ],
      }),
    ).toEqual([]);
  });

  it('блокирует пустые ячейки сетки', () => {
    expect(
      cmsPublishBlockers({
        ...ready,
        bento: {
          blocks: [{ type: 'bento-vert', slots: [{ assetId: 'g-0' }, { assetId: null }] }],
        },
      }),
    ).toContain('bento_empty_slots');
  });

  it('блокирует пункт с текстом без иконки каталога', () => {
    expect(
      cmsPublishBlockers({
        ...ready,
        included: [{ text: 'Трансфер', iconKey: UNSET_INCLUDED_ICON_KEY }],
      }),
    ).toContain('included_icon_required');
    expect(
      cmsPublishBlockers({
        ...ready,
        included: [{ text: '  ', iconKey: UNSET_INCLUDED_ICON_KEY }],
      }),
    ).toContain('tour_not_ready');
  });
});

describe('cmsPublishBlockersForIntent', () => {
  it('allows hiding a live tour even when the draft card is incomplete', () => {
    expect(
      cmsPublishBlockersForIntent(
        { ...base, status: 'hidden' },
        { hasPublishedSnapshot: true },
      ),
    ).toEqual([]);
  });

  it('still requires a complete card to show an unpublished or returning tour', () => {
    expect(
      cmsPublishBlockersForIntent(base, { hasPublishedSnapshot: true }),
    ).toContain('tour_not_ready');
    expect(
      cmsPublishBlockersForIntent(
        { ...base, status: 'hidden' },
        { hasPublishedSnapshot: false },
      ),
    ).toContain('tour_not_ready');
  });
});
