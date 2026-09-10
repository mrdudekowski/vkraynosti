import { describe, expect, it } from 'vitest';
import { tourStatusTone } from './tourStatusAppearance';

describe('tourStatusTone', () => {
  it('кодирует статус не только цветом: разные tone для разных статусов', () => {
    expect(tourStatusTone('active')).toBe('success');
    expect(tourStatusTone('draft')).toBe('draft');
    expect(tourStatusTone('in_development')).toBe('warning');
    expect(tourStatusTone('hidden')).toBe('info');
  });
});
