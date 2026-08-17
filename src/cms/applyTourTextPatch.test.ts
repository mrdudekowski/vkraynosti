import { describe, expect, it } from 'vitest';
import { applyTourTextPatch, upsertTourInPublishedCatalog } from './applyTourTextPatch';
import { UNSET_INCLUDED_ICON_KEY } from './includedIconCatalog';
import type { CmsTourDocument } from './cmsTourDocument';

const document: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'active',
  title: 'Изюбриная',
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description: 'Старый текст',
  descriptionLeadBold: 'Гора',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [{ timeLabel: '04:30', description: 'Выезд' }],
  included: [{ text: 'Трансфер', iconKey: 'van-shuttle' }],
  coverAssetId: 'cover',
  prefaceAssetId: 'preface',
  assets: [
    {
      id: 'cover',
      stillUrl: 'https://cdn.example/cover.webp',
      videoUrl: null,
      alt: 'Обложка',
    },
    {
      id: 'preface',
      stillUrl: 'https://cdn.example/preface.webp',
      videoUrl: null,
      alt: 'Предисловие',
    },
  ],
  bento: {
    blocks: [{ type: 'bento-single', slots: [{ assetId: 'cover' }] }],
  },
  legacyGalleryVariant: null,
};

describe('applyTourTextPatch', () => {
  it('меняет тексты и не трогает bento', () => {
    const next = applyTourTextPatch(document, {
      description: '  Новый текст  ',
      descriptionLeadBold: 'Изюбриная (1433 м)',
      descriptionAside: '',
      prefaceAssetId: 'cover',
      included: [{ text: 'Гид', iconKey: 'user-tie' }],
      program: [{ timeLabel: '05:00', description: 'Сбор' }],
      programAdditionalNotes: ['  Тайминг ориентировочный  ', ''],
    });

    expect(next.description).toBe('Новый текст');
    expect(next.descriptionLeadBold).toBe('Изюбриная (1433 м)');
    expect(next.descriptionAside).toBeUndefined();
    expect(next.prefaceAssetId).toBe('cover');
    expect(next.included).toEqual([{ text: 'Гид', iconKey: 'user-tie' }]);
    expect(next.program).toEqual([{ timeLabel: '05:00', description: 'Сбор' }]);
    expect(next.programAdditionalNotes).toEqual(['Тайминг ориентировочный']);
    expect(next.bento).toEqual(document.bento);
    expect(next.title).toBe(document.title);
  });

  it('отклоняет неизвестную иконку и чужой preface', () => {
    expect(() =>
      applyTourTextPatch(document, {
        description: 'x',
        prefaceAssetId: 'preface',
        included: [{ text: 'x', iconKey: 'not-an-icon' }],
        program: [],
      })
    ).toThrow(/Unknown included icon/);

    expect(() =>
      applyTourTextPatch(document, {
        description: 'x',
        prefaceAssetId: 'missing',
        included: [],
        program: [],
      })
    ).toThrow(/Unknown preface asset/);
  });

  it('разрешает иконку-заглушку черновика', () => {
    const next = applyTourTextPatch(document, {
      description: 'x',
      prefaceAssetId: 'preface',
      included: [{ text: 'Гид', iconKey: UNSET_INCLUDED_ICON_KEY }],
      program: [],
    });
    expect(next.included[0]?.iconKey).toBe(UNSET_INCLUDED_ICON_KEY);
  });

  it('обновляет alt кадров', () => {
    const next = applyTourTextPatch(document, {
      description: 'x',
      prefaceAssetId: 'preface',
      included: document.included,
      program: document.program,
      assetAlts: { cover: 'Новый alt' },
    });
    expect(next.assets.find((asset) => asset.id === 'cover')?.alt).toBe('Новый alt');
    expect(next.assets.find((asset) => asset.id === 'preface')?.alt).toBe('Предисловие');
  });

  it('меняет поля карточки, цены и SEO', () => {
    const next = applyTourTextPatch(document, {
      description: 'x',
      prefaceAssetId: 'preface',
      included: document.included,
      program: document.program,
      subtitle: '  Бухта  ',
      heroPhrase: '  Сопки  ',
      duration: '  2 дня  ',
      difficulty: 'Hard',
      difficultyDisplayLabel: '  Сложный хайкинг  ',
      metaAudienceLabel: '  Семья  ',
      price: '  18 000 ₽  ',
      pricePrevious: '  20 000 ₽  ',
      priceFootnote: '  за человека  ',
      seoDescription: '  Поездка к сопкам  ',
    });

    expect(next.subtitle).toBe('Бухта');
    expect(next.heroPhrase).toBe('Сопки');
    expect(next.duration).toBe('2 дня');
    expect(next.difficulty).toBe('Hard');
    expect(next.difficultyDisplayLabel).toBe('Сложный хайкинг');
    expect(next.metaAudienceLabel).toBe('Семья');
    expect(next.price).toBe('18 000 ₽');
    expect(next.pricePrevious).toBe('20 000 ₽');
    expect(next.priceFootnote).toBe('за человека');
    expect(next.seoDescription).toBe('Поездка к сопкам');
    expect(next.status).toBe(document.status);
  });

  it('меняет название и человекопонятный URL', () => {
    const next = applyTourTextPatch(document, {
      title: '  Полуостров Краббе  ',
      slug: 'poluostrov-krabbe',
      description: 'x',
      prefaceAssetId: 'preface',
      included: document.included,
      program: document.program,
    });
    expect(next.title).toBe('Полуостров Краббе');
    expect(next.slug).toBe('poluostrov-krabbe');
  });

  it('отклоняет пустое название и невалидный slug', () => {
    expect(() =>
      applyTourTextPatch(document, {
        title: '   ',
        description: 'x',
        prefaceAssetId: 'preface',
        included: [],
        program: [],
      }),
    ).toThrow(/title/);

    expect(() =>
      applyTourTextPatch(document, {
        slug: 'Полуостров Краббе',
        description: 'x',
        prefaceAssetId: 'preface',
        included: [],
        program: [],
      }),
    ).toThrow(/slug/);
  });
});

describe('upsertTourInPublishedCatalog', () => {
  it('заменяет тур на месте', () => {
    const updated = applyTourTextPatch(document, {
      description: 'После правки',
      prefaceAssetId: 'preface',
      included: document.included,
      program: document.program,
    });
    const catalog = upsertTourInPublishedCatalog(
      { schemaVersion: 1, tours: [document] },
      updated
    );
    expect(catalog.tours).toHaveLength(1);
    expect(catalog.tours[0]?.description).toBe('После правки');
  });
});
