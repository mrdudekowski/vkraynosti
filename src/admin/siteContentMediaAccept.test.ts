import { describe, expect, it } from 'vitest';
import { isSiteContentImageFile, isSiteContentPdfFile } from './siteContentMediaAccept';

describe('siteContentMediaAccept', () => {
  it('accepts JPEG and rejects HEIC', () => {
    expect(isSiteContentImageFile(new File(['jpg'], 'anna.jpg', { type: 'image/jpeg' }))).toBe(true);
    expect(isSiteContentImageFile(new File(['heic'], 'anna.heic', { type: 'image/heic' }))).toBe(false);
  });

  it('accepts PDF by mime and rejects images as PDF', () => {
    expect(isSiteContentPdfFile(new File(['pdf'], 'offer.pdf', { type: 'application/pdf' }))).toBe(true);
    expect(isSiteContentPdfFile(new File(['jpg'], 'anna.jpg', { type: 'image/jpeg' }))).toBe(false);
  });
});
