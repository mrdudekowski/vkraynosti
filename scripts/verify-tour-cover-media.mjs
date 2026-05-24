#!/usr/bin/env node
import fs from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadToursViaVite } from './lib/loadToursViaVite.mjs';
import {
  parseTourCoverCliArgs,
  selectToursForCoverJob,
  uniqueCoverUrls,
} from './lib/tourCoverCliArgs.mjs';
import {
  desktopCoverToMobilePath,
  formatKiB,
  isTourCoverWebpUrl,
  resolveDesktopCoverOnDisk,
  resolvePublicFilePath,
} from './lib/tourCoverMobile.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESKTOP_WARN_BYTES = 2 * 1024 * 1024;

async function main() {
  const options = parseTourCoverCliArgs(process.argv);
  const { tours, baseUrl } = await loadToursViaVite();
  const selectedTours = selectToursForCoverJob(
    tours,
    options.tourId != null || options.season != null ? options : { ...options, all: true }
  );
  const coverUrls = uniqueCoverUrls(selectedTours).filter(isTourCoverWebpUrl);

  const missingDesktop = [];
  const missingMobile = [];
  const warnings = [];

  for (const desktopUrl of coverUrls) {
    const desktopOnDisk = resolveDesktopCoverOnDisk(desktopUrl, repoRoot, baseUrl);
    const mobileUrl = desktopCoverToMobilePath(desktopUrl);
    const mobilePath = resolvePublicFilePath(mobileUrl, repoRoot, baseUrl);

    if (desktopOnDisk == null) {
      missingDesktop.push(desktopUrl);
      continue;
    }

    const desktopSize = fs.statSync(desktopOnDisk.filePath).size;
    if (desktopSize > DESKTOP_WARN_BYTES) {
      warnings.push(`${desktopUrl} (${formatKiB(desktopSize)} desktop)`);
    }

    if (!fs.existsSync(mobilePath)) {
      missingMobile.push({ tourCover: desktopUrl, expectedMobile: mobileUrl });
    }
  }

  if (warnings.length > 0) {
    process.stdout.write('\nDesktop cover size warnings (> 2 MiB):\n');
    for (const line of warnings) {
      process.stdout.write(`- ${line}\n`);
    }
  }

  if (missingDesktop.length > 0) {
    process.stderr.write('\nMissing desktop cover files (skipped mobile check):\n');
    for (const url of missingDesktop) {
      process.stderr.write(`- ${url}\n`);
    }
  }

  if (missingMobile.length > 0) {
    process.stderr.write('\nMissing mobile cover files:\n');
    for (const entry of missingMobile) {
      process.stderr.write(`- ${entry.expectedMobile} (from ${entry.tourCover})\n`);
    }
  }

  const verifiedCount = coverUrls.length - missingDesktop.length;

  if (missingMobile.length === 0) {
    process.stdout.write(
      `Verified ${verifiedCount} tour cover(s) with mobile variants` +
        (missingDesktop.length > 0 ? ` (${missingDesktop.length} without desktop media).\n` : '.\n')
    );
    return;
  }

  process.stderr.write(`\nVerify failed: missingMobile=${missingMobile.length}\n`);
  process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
