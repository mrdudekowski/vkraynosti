import { describe, expect, it } from 'vitest';
import {
  META_DESCRIPTION_MAX_LENGTH,
  finalizeMetaDescription,
  isNormalizedMetaContent,
  normalizeMetaContent,
  truncateMetaDescription,
} from './metaContent';

describe('normalizeMetaContent', () => {
  it('joins multiline text with spaces', () => {
    expect(normalizeMetaContent('Лето: два дня\nу моря')).toBe('Лето: два дня у моря');
  });

  it('collapses repeated spaces', () => {
    expect(normalizeMetaContent('Лето:   два дня')).toBe('Лето: два дня');
  });
});

describe('truncateMetaDescription', () => {
  it('returns short text unchanged', () => {
    expect(truncateMetaDescription('Короткий текст')).toBe('Короткий текст');
  });

  it('truncates at word boundary with ellipsis', () => {
    const long = 'А'.repeat(META_DESCRIPTION_MAX_LENGTH + 20);
    const result = truncateMetaDescription(long);
    expect(result.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('finalizeMetaDescription', () => {
  it('normalizes and enforces max length', () => {
    const raw = '  Лето:  два   дня\nу моря.  ';
    expect(finalizeMetaDescription(raw)).toBe('Лето: два дня у моря.');
    expect(isNormalizedMetaContent(finalizeMetaDescription(raw))).toBe(true);
  });
});
