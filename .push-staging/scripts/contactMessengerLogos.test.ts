import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PUBLIC_ASSET_BASE } from '../src/constants/fonts';
import { CONTACT_MESSENGER_LOGO_URLS } from '../src/constants/images';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function publicAssetUrlToRepoPath(assetUrl: string): string {
  const prefix = PUBLIC_ASSET_BASE;
  const relative = assetUrl.startsWith(prefix) ? assetUrl.slice(prefix.length) : assetUrl.replace(/^\//, '');
  return path.join(repoRoot, 'public', relative);
}

describe('contact messenger logos (public/)', () => {
  it.each(CONTACT_MESSENGER_LOGO_URLS)('file exists for %s', assetUrl => {
    const filePath = publicAssetUrlToRepoPath(assetUrl);
    expect(fs.existsSync(filePath), `missing public asset: ${filePath}`).toBe(true);
  });

  it('has one URL per ContactMessengerLogo variant', () => {
    expect(CONTACT_MESSENGER_LOGO_URLS).toHaveLength(4);
  });
});
