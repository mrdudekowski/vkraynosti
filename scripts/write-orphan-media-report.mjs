#!/usr/bin/env node
/**
 * Write human-readable orphan media report from media:inventory JSON.
 * Output: TimeWebDoc/examples/orphan-media-report.txt (tracked ops doc).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = path.join(repoRoot, 'TimeWebDoc', 'audit-phase2-inventory.json');
const outPath = path.join(repoRoot, 'TimeWebDoc', 'examples', 'orphan-media-report.txt');

function groupByTour(orphanFiles) {
  /** @type {Map<string, string[]>} */
  const byTour = new Map();
  for (const filePath of orphanFiles) {
    const match = filePath.match(/^public\/tours\/([^/]+)\//);
    const key = match ? match[1] : '_other';
    const list = byTour.get(key) ?? [];
    list.push(filePath);
    byTour.set(key, list);
  }
  return [...byTour.entries()].sort((a, b) => b[1].length - a[1].length);
}

function run() {
  if (!fs.existsSync(inventoryPath)) {
    throw new Error(`Run npm run media:inventory first. Missing ${inventoryPath}`);
  }
  const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
  const orphanFiles = inventory.orphanFiles ?? [];
  const orphanDirs = inventory.orphanDirs ?? [];
  const missing = inventory.missing ?? [];

  const lines = [
    'Vkraynosti — orphan / missing media report',
    `Generated from: ${path.relative(repoRoot, inventoryPath)}`,
    `Date: ${new Date().toISOString()}`,
    '',
    `Orphan dirs (${orphanDirs.length}): ${orphanDirs.join(', ') || '(none)'}`,
    `Orphan files: ${orphanFiles.length}`,
    `SSOT missing on disk: ${missing.length}`,
    '',
    '--- Missing (SSOT without file) ---',
    ...missing.map((m) => `- ${m.path} (${m.tourId ?? 'n/a'})`),
    '',
    '--- Orphan files by tour folder (top groups) ---',
  ];

  for (const [tourId, files] of groupByTour(orphanFiles)) {
    lines.push(`\n[${tourId}] ${files.length} files`);
    for (const f of files.slice(0, 15)) {
      lines.push(`  - ${f}`);
    }
    if (files.length > 15) {
      lines.push(`  ... +${files.length - 15} more`);
    }
  }

  lines.push(
    '',
    'Actions (require product approval):',
    '- delete: file not referenced in images.ts / toursData',
    '- wire: add to images.ts if intentional asset',
    '- keep: generated variant (e.g. cover.mobile.webp) pending SSOT update',
    '',
    'Regenerate: npm run media:inventory && npm run media:orphan-report',
  );

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
  process.stdout.write(`Wrote ${path.relative(repoRoot, outPath)}\n`);
}

run();
