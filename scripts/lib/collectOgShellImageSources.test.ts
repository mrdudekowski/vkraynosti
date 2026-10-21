import { describe, expect, it } from 'vitest';
import { collectOgShellImageSources } from './copyOgShellAssets.ts';

describe('collectOgShellImageSources', () => {
  it('excludes disabled routes and keeps normal route images', () => {
    expect(
      collectOgShellImageSources([
        { imagePathOrUrl: 'safety/hero.webp', includeSocialMetadata: false },
        { imagePathOrUrl: 'tours/summer/cover.webp' },
      ]),
    ).toEqual(['tours/summer/cover.webp']);
  });
});
