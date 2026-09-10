import { describe, expect, it } from 'vitest';
import { BOOT_SPLASH_BUBBLE_COUNT } from './bootSplash';
import { UI } from '../constants/ui';

describe('UI.bootSplash.statusLines', () => {
  it('lists seven unique loading status phrases', () => {
    const lines = UI.bootSplash.statusLines;
    expect(lines).toHaveLength(7);
    expect(new Set(lines).size).toBe(7);
  });

  it('matches bubble count', () => {
    expect(BOOT_SPLASH_BUBBLE_COUNT).toBe(UI.bootSplash.statusLines.length);
  });
});