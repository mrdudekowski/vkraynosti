import { describe, expect, it } from 'vitest';
import { getTourGalleryLayoutVariant } from './tourGalleryLayoutVariant';

describe('getTourGalleryLayoutVariant', () => {
  it('маппинг известных туров', () => {
    expect(getTourGalleryLayoutVariant('winter-1')).toBe('izubrinaya');
    expect(getTourGalleryLayoutVariant('spring-4')).toBe('sestra');
    expect(getTourGalleryLayoutVariant('spring-10')).toBe('askold');
  });

  it('неизвестный id — default', () => {
    expect(getTourGalleryLayoutVariant('unknown-tour')).toBe('default');
  });
});
