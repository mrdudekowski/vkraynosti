import { describe, expect, it } from 'vitest';
import { homeNavbarChromeOpacityShellClass } from './homeNavbarChrome';

describe('homeNavbarChromeOpacityShellClass', () => {
  it('omits transition-opacity for scroll-linked opacity', () => {
    expect(homeNavbarChromeOpacityShellClass(false)).toBe('');
    expect(homeNavbarChromeOpacityShellClass(false)).not.toContain('transition-opacity');
  });

  it('uses duration-0 when reduced motion', () => {
    expect(homeNavbarChromeOpacityShellClass(true)).toBe('duration-0');
  });
});
