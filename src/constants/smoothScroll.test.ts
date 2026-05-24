import { describe, expect, it } from 'vitest';
import { NAVBAR_CONTENT_HEIGHT_PX } from './layoutChrome';
import { getNavbarScrollOffsetPx, NAVBAR_SCROLL_OFFSET_PX } from './smoothScroll';

describe('smoothScroll navbar offset', () => {
  it('NAVBAR_SCROLL_OFFSET_PX matches content height fallback', () => {
    expect(NAVBAR_SCROLL_OFFSET_PX).toBe(-NAVBAR_CONTENT_HEIGHT_PX);
  });

  it('getNavbarScrollOffsetPx falls back without DOM', () => {
    expect(getNavbarScrollOffsetPx()).toBe(-NAVBAR_CONTENT_HEIGHT_PX);
  });
});
