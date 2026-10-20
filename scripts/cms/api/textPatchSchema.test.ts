import { describe, expect, it } from 'vitest';
import { textPatchSchema } from './app';

describe('CMS tour text patch schema', () => {
  it('accepts the SEO fields submitted by the tour editor', () => {
    const parsed = textPatchSchema.safeParse({
      description: 'Текст тура',
      prefaceAssetId: null,
      included: [],
      program: [],
      seo: {
        title: 'Тур из Владивостока | Вкрайности',
        description: 'Короткое SEO-описание маршрута.',
        h1: 'Название тура',
        keywords: ['тур по Приморью'],
      },
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.seo).toEqual({
        title: 'Тур из Владивостока | Вкрайности',
        description: 'Короткое SEO-описание маршрута.',
        h1: 'Название тура',
        keywords: ['тур по Приморью'],
      });
    }
  });
});
