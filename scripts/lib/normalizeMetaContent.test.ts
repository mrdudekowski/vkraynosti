import { describe, expect, it } from 'vitest';
import { isNormalizedMetaContent, normalizeMetaContent } from './normalizeMetaContent.ts';

describe('normalizeMetaContent', () => {
  it('joins multiline title with spaces', () => {
    expect(normalizeMetaContent('Робинзонада в районе Трёхи — Лето\n| Вкрайности')).toBe(
      'Робинзонада в районе Трёхи — Лето | Вкрайности',
    );
  });

  it('collapses repeated spaces', () => {
    expect(normalizeMetaContent('Лето:   два дня    у моря')).toBe('Лето: два дня у моря');
  });

  it('trims leading and trailing whitespace', () => {
    expect(normalizeMetaContent('  title  ')).toBe('title');
  });
});

describe('isNormalizedMetaContent', () => {
  it('returns true for normalized strings', () => {
    expect(isNormalizedMetaContent('Лето: два дня у моря')).toBe(true);
  });

  it('returns false when newlines remain', () => {
    expect(isNormalizedMetaContent('line1\nline2')).toBe(false);
  });
});
