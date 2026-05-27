import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PUBLIC_ASSET_BASE } from './fonts';
import { CONTACT_MESSENGER_LOGO_URLS } from './images';

function publicAssetUrlToRepoPath(assetUrl: string): string {
  const prefix = PUBLIC_ASSET_BASE;
  const relative = assetUrl.startsWith(prefix) ? assetUrl.slice(prefix.length) : assetUrl.replace(/^\//, '');
  return join(process.cwd(), 'public', relative);
}

describe('contact messenger logos (public/)', () => {
  it.each(CONTACT_MESSENGER_LOGO_URLS)('file exists for %s', assetUrl => {
    const path = publicAssetUrlToRepoPath(assetUrl);
    expect(existsSync(path), `missing public asset: ${path}`).toBe(true);
  });

  it('has one URL per ContactMessengerLogo variant', () => {
    expect(CONTACT_MESSENGER_LOGO_URLS).toHaveLength(4);
  });
});
