/**
 * @vitest-environment node
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadToursViaVite } from './lib/loadToursViaVite.mjs';
import {
  desktopCoverToMobilePath,
  resolveDesktopCoverOnDisk,
} from './lib/tourCoverMobile.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('tour cover mobile variants on disk', () => {
  it(
    'every tour with desktop cover on disk has matching .mobile.webp',
    async () => {
    const { tours, baseUrl } = await loadToursViaVite();
    const missingMobile = [];
    const missingDesktop = [];

    for (const tour of tours) {
      const desktopUrl = tour.imageUrl;
      if (!desktopUrl?.includes('/tours/') || !/\.webp(\?|#|$)/i.test(desktopUrl)) {
        continue;
      }

      const desktopOnDisk = resolveDesktopCoverOnDisk(desktopUrl, repoRoot, baseUrl);
      if (desktopOnDisk == null) {
        missingDesktop.push(`${tour.id}: ${desktopUrl}`);
        continue;
      }

      const mobileUrl = desktopCoverToMobilePath(desktopUrl);
      const mobilePath = path.join(
        repoRoot,
        'public',
        mobileUrl.replace(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`, '')
      );

      if (!fs.existsSync(mobilePath)) {
        missingMobile.push(`${tour.id}: ${mobileUrl}`);
      }
    }

    expect(
      missingMobile,
      `missing mobile covers (run npm run media:covers-mobile):\n${missingMobile.join('\n')}`
    ).toEqual([]);

    if (missingDesktop.length > 0) {
      console.warn(
        `[tourCoverMedia] tours without desktop cover files (${missingDesktop.length}):\n${missingDesktop.join('\n')}`
      );
    }
  },
  20_000
);
});
