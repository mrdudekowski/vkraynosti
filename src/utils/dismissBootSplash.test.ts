import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BOOT_SPLASH_ELEMENT_ID } from '../constants/bootSplash';
import { dismissBootSplash } from './dismissBootSplash';

describe('dismissBootSplash', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-app-ready');
    document.body.innerHTML = `<div id="${BOOT_SPLASH_ELEMENT_ID}"></div><div id="root"></div>`;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('removes splash and marks app ready when reduced motion is preferred', () => {
    dismissBootSplash();

    expect(document.getElementById(BOOT_SPLASH_ELEMENT_ID)).toBeNull();
    expect(document.documentElement.getAttribute('data-app-ready')).toBe('');
  });
});
