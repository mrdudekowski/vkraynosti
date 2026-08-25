import { describe, expect, it } from 'vitest';
import { ADMIN_BREAKPOINT_DESKTOP_PX, ADMIN_QA_VIEWPORTS_PX } from '../../constants/adminUiTokens';
import { BREAKPOINT_MD_PX } from '../../constants/breakpoints';
import { readAdminViewport } from './useAdminViewport';

function mockViewportWidth(widthPx: number) {
  window.matchMedia = (query: string) => {
    const min = /\(min-width:\s*(\d+)px\)/.exec(query);
    const matches = min != null ? widthPx >= Number(min[1]) : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    };
  };
}

describe('admin responsive QA viewports', () => {
  it('lists the spec widths for Phase 5', () => {
    expect(ADMIN_QA_VIEWPORTS_PX).toEqual([1920, 1440, 1280, 1024, 768, 430, 390, 360]);
  });

  it.each([
    [360, 'mobile'],
    [390, 'mobile'],
    [430, 'mobile'],
    [768, 'tablet'],
    [1023, 'tablet'],
    [1024, 'desktop'],
    [1280, 'desktop'],
    [1440, 'desktop'],
    [1920, 'desktop'],
  ] as const)('%s px → %s', (width, expected) => {
    mockViewportWidth(width);
    expect(readAdminViewport()).toBe(expected);
  });

  it('keeps tablet below desktop and mobile below md', () => {
    expect(BREAKPOINT_MD_PX).toBe(768);
    expect(ADMIN_BREAKPOINT_DESKTOP_PX).toBe(1024);
  });
});
