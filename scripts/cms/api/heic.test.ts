import { describe, expect, it, vi } from 'vitest';
import { isHeicStill, prepareCmsImageUpload } from './heic';

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

  it('converts a HEIC upload to jpeg bytes through the shared helper', async () => {
    const convert = vi.fn(async () => new Uint8Array([255, 216, 255]));
    const result = await prepareCmsImageUpload(
      new File([new Uint8Array([1, 2, 3])], 'anna.heic', { type: 'image/heic' }),
      () => null,
      convert,
    );
    expect(convert).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      bytes: new Uint8Array([255, 216, 255]),
      mimeType: 'image/jpeg',
      extension: 'jpg',
    });
  });

  it('passes through a jpeg and rejects an unknown type', async () => {
    const jpeg = await prepareCmsImageUpload(
      new File([new Uint8Array([1, 2])], 'anna.jpg', { type: 'image/jpeg' }),
      (mime) => (mime === 'image/jpeg' ? 'jpg' : null),
    );
    expect(jpeg).toEqual({
      ok: true,
      bytes: new Uint8Array([1, 2]),
      mimeType: 'image/jpeg',
      extension: 'jpg',
    });
    expect(
      await prepareCmsImageUpload(
        new File([new Uint8Array([1])], 'anna.gif', { type: 'image/gif' }),
        () => null,
      ),
    ).toEqual({ ok: false, error: 'invalid_type' });
  });
});
