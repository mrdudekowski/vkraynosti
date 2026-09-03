import { describe, expect, it } from 'vitest';
import type { CmsTourDocument } from '../cms/cmsTourDocument';
import { patchFromDocument, storedTextPatchFromDocument } from './patchFromDocument';

const document: CmsTourDocument = {
  id: 'winter-1',
  slug: 'izubrinaya',
  season: 'winter',
  status: 'draft',
  title: 'Изюбриная',
  subtitle: 'Зима',
  heroPhrase: 'Ели',
  description:
    ' — живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового. «Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
  descriptionLeadBold: 'Гора Изюбриная (1433 м)',
  duration: '1 день',
  difficulty: 'Medium',
  price: 'по запросу',
  program: [
    { day: 2, timeLabel: '09:00', description: 'Старт' },
  ],
  included: [],
  coverAssetId: null,
  prefaceAssetId: null,
  assets: [],
  bento: { blocks: [] },
  legacyGalleryVariant: null,
};

describe('patchFromDocument', () => {
  it('раскладывает одноколоночное описание в две колонки как на сайте', () => {
    const patch = patchFromDocument(document);
    expect(patch.description).toBe(
      'живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового.',
    );
    expect(patch.descriptionAside).toBe(
      '«Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    );
  });

  it('хранит исходный снимок без сплита, чтобы автосейв записал колонки в CMS', () => {
    const stored = storedTextPatchFromDocument(document);
    expect(stored.description).toBe(document.description);
    expect(stored.descriptionAside).toBe('');
  });

  it('переносит день программы в draft', () => {
    expect(patchFromDocument(document).program).toEqual([
      { day: 2, timeLabel: '09:00', description: 'Старт' },
    ]);
  });
});
