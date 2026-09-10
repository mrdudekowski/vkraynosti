import { describe, expect, it } from 'vitest';
import { isHeicStill } from './heic';

describe('HEIC still uploads', () => {
  it.each([
    ['image/heic', 'photo.bin'],
    ['image/heif', 'photo.bin'],
    ['', 'photo.HEIC'],
    ['', 'photo.heif'],
  ])('recognizes %s %s as HEIC', (type, name) => {
    expect(isHeicStill(new File([new Uint8Array([1])], name, { type }))).toBe(true);
  });

  it('does not classify regular supported images as HEIC', () => {
    expect(isHeicStill(new File([new Uint8Array([1])], 'photo.jpg', { type: 'image/jpeg' }))).toBe(false);
  });
});
