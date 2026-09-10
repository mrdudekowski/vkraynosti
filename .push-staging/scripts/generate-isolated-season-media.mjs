import { cp, mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toursDir = resolve(rootDir, 'public/tours');

const SUMMER_PAIRS = [
  ['summer-2', 'spring-12'],
  ['summer-3', 'spring-10'],
  ['summer-4', 'spring-11'],
  ['summer-5', 'spring-13'],
  ['summer-6', 'spring-7'],
];

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyTourDir(fromId, toId) {
  const from = resolve(toursDir, fromId);
  const to = resolve(toursDir, toId);
  if (!(await pathExists(from))) {
    throw new Error(`Missing source media folder: public/tours/${fromId}`);
  }
  await mkdir(toursDir, { recursive: true });
  await cp(from, to, { recursive: true, force: true });
  process.stdout.write(`Copied public/tours/${fromId} -> public/tours/${toId}\n`);
}

async function copySeasonFolders() {
  for (let n = 1; n <= 13; n += 1) {
    await copyTourDir(`spring-${n}`, `fall-${n}`);
  }
  for (const [summerId, springId] of SUMMER_PAIRS) {
    await copyTourDir(springId, summerId);
  }
}

function runConstantsGenerator() {
  const result = spawnSync(
    process.execPath,
    ['scripts/write-season-media-constants.mjs'],
    { cwd: rootDir, stdio: 'inherit', env: process.env }
  );
  if (result.status !== 0) {
    throw new Error('write-season-media-constants.mjs failed');
  }
}

async function main() {
  await copySeasonFolders();
  runConstantsGenerator();
  process.stdout.write('Season media bootstrap complete.\n');
}

main().catch((error) => {
  process.stderr.write(
    `generate-isolated-season-media failed: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
