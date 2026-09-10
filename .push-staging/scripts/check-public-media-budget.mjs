#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MEDIA_BUDGET_LIMITS,
  MEDIA_EXT_RE,
  classifyPublicTourMediaPath,
  formatBytes,
} from './public-media-budget-core.mjs';

export { MEDIA_BUDGET_LIMITS, classifyPublicTourMediaPath, formatBytes };

function walkMediaFiles(directory, out = []) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walkMediaFiles(absolutePath, out);
    } else if (MEDIA_EXT_RE.test(entry.name)) {
      out.push(absolutePath);
    }
  }
  return out;
}

export function analyzePublicMediaFiles(files, repoRoot = process.cwd()) {
  const records = files.map((absolutePath) => {
    const sizeBytes = fs.statSync(absolutePath).size;
    const relativePath = path.relative(repoRoot, absolutePath).replace(/\\/g, '/');
    const category = classifyPublicTourMediaPath(relativePath);
    const limits = MEDIA_BUDGET_LIMITS[category] ?? MEDIA_BUDGET_LIMITS.other;
    return {
      relativePath,
      category,
      sizeBytes,
      warning: sizeBytes > limits.warnBytes,
      failure: sizeBytes > limits.failBytes,
    };
  });

  return {
    records,
    warnings: records.filter((record) => record.warning),
    failures: records.filter((record) => record.failure),
  };
}

function printGroup(title, records) {
  if (records.length === 0) return;
  console.log(`\n${title}`);
  for (const record of records) {
    console.log(`- ${formatBytes(record.sizeBytes)} ${record.category} ${record.relativePath}`);
  }
}

export function runPublicMediaBudgetCheck({
  repoRoot = process.cwd(),
  mediaRoot = path.join(repoRoot, 'public', 'tours'),
  topLimit = 20,
} = {}) {
  if (!fs.existsSync(mediaRoot)) {
    throw new Error(`Media root does not exist: ${mediaRoot}`);
  }

  const files = walkMediaFiles(mediaRoot);
  const analysis = analyzePublicMediaFiles(files, repoRoot);
  const largest = [...analysis.records]
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, topLimit);

  console.log(`Checked ${analysis.records.length} public tour media files.`);
  printGroup(`Top ${largest.length} largest media files:`, largest);
  printGroup('Budget warnings:', analysis.warnings);
  printGroup('Budget failures:', analysis.failures);

  return analysis;
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);

if (isCli) {
  try {
    const analysis = runPublicMediaBudgetCheck();
    if (analysis.failures.length > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
