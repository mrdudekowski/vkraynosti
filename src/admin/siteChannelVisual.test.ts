import { describe, expect, it } from 'vitest';
import { ADMIN_UI } from './constants/ui';
import { siteChannelInputMode, siteChannelPresetIcon, siteChannelTypeLabel } from './siteChannelVisual';

describe('siteChannelVisual', () => {
  it('maps email and max to the same preset icons as the public site seed', () => {
    expect(siteChannelPresetIcon('email')).toEqual({
      kind: 'preset',
      value: 'envelope',
      alt: ADMIN_UI.siteChannelTypes.email,
    });
    expect(siteChannelPresetIcon('max')).toEqual({
      kind: 'preset',
      value: 'max',
      alt: ADMIN_UI.siteChannelTypes.max,
    });
  });

  it('labels known types and uses email input mode for почта', () => {
    expect(siteChannelTypeLabel('email')).toBe(ADMIN_UI.siteChannelTypes.email);
    expect(siteChannelInputMode('email')).toBe('email');
    expect(siteChannelInputMode('phone')).toBe('tel');
  });
});
