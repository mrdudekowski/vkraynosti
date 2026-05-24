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
  encodeMobileCoverWebp,
  formatKiB,
  isTourCoverWebpUrl,
  resolveDesktopCoverOnDisk,
  resolvePublicFilePath,
} from './lib/tourCoverMobile.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const options = parseTourCoverCliArgs(process.argv);
  const { tours, baseUrl } = await loadToursViaVite();
  const selectedTours = selectToursForCoverJob(tours, options);
  const coverUrls = uniqueCoverUrls(selectedTours).filter(isTourCoverWebpUrl);

  if (coverUrls.length === 0) {
    process.stdout.write('No tour cover URLs to process.\n');
    return;
  }

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const desktopUrl of coverUrls) {
    const desktopOnDisk = resolveDesktopCoverOnDisk(desktopUrl, repoRoot, baseUrl);
    const mobileUrl = desktopCoverToMobilePath(desktopUrl);
    const mobilePath = resolvePublicFilePath(mobileUrl, repoRoot, baseUrl);

    if (desktopOnDisk == null) {
      process.stderr.write(`Missing desktop cover: ${desktopUrl}\n`);
      failed += 1;
      continue;
    }

    const { filePath: desktopPath } = desktopOnDisk;

    if (fs.existsSync(mobilePath) && !options.force) {
      if (options.missingOnly) {
        skipped += 1;
        continue;
      }
    }

    if (options.dryRun) {
      process.stdout.write(`[dry-run] ${desktopUrl} -> ${mobileUrl}\n`);
      continue;
    }

    try {
      const beforeDesktop = fs.statSync(desktopPath).size;
      const { sizeBytes } = encodeMobileCoverWebp(desktopPath, mobilePath);
      process.stdout.write(
        `Created ${mobileUrl} (${formatKiB(sizeBytes)} from desktop ${formatKiB(beforeDesktop)})\n`
      );
      created += 1;
    } catch (error) {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`
      );
      failed += 1;
    }
  }

  process.stdout.write(
    `Done: created=${created}, skipped=${skipped}, failed=${failed}, covers=${coverUrls.length}\n`
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
