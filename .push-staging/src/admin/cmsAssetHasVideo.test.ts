import { describe, expect, it } from 'vitest';
import { cmsAssetHasVideo } from './cmsAssetHasVideo';

describe('cmsAssetHasVideo', () => {
  it('true только если задан videoUrl', () => {
    expect(cmsAssetHasVideo({ videoUrl: null })).toBe(false);
    expect(cmsAssetHasVideo({ videoUrl: '' })).toBe(false);
    expect(cmsAssetHasVideo({ videoUrl: '/clip.webm' })).toBe(true);
  });
});
