#!/usr/bin/env node
/**
 * Mirror public/ → TimeWeb S3 (keys = paths without `public/` prefix).
 * Excludes public/fonts/ (App-only). Requires AWS CLI v2 in PATH.
 *
 * Env: S3_BUCKET, AWS_ENDPOINT_URL (TimeWeb), optional S3_PREFIX, AWS_* credentials.
 * Optional: S3_PUBLIC_BASE_URL — same origin as VITE_PUBLIC_ASSET_BASE_URL for --verify-sample.
 *
 * @example
 * npm run sync:s3:dry-run
 * npm run sync:s3
 * npm run sync:s3 -- --verify-sample
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  S3_VERIFY_SAMPLE_KEYS,
  buildAwsS3SyncArgs,
  buildPublicObjectUrl,
  buildS3SyncTarget,
} from './lib/s3SyncScope.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(repoRoot, 'public');

function parseFlags(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    deleteRemote: argv.includes('--delete'),
    verifySample: argv.includes('--verify-sample'),
    help: argv.includes('--help') || argv.includes('-h'),
  };
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing env ${name}. See TimeWebDoc/examples/s3.env.example`);
  }
  return value;
}

function assertAwsCliAvailable() {
  const probe = spawnSync('aws', ['--version'], { encoding: 'utf8', shell: true });
  if (probe.status !== 0) {
    throw new Error(
      'AWS CLI not found. Install AWS CLI v2 and configure credentials for TimeWeb S3.'
    );
  }
}

function runAwsSync(flags) {
  if (!fs.existsSync(publicDir)) {
    throw new Error(`Missing directory: ${publicDir}`);
  }

  const bucket = requireEnv('S3_BUCKET');
  const endpointUrl = process.env.AWS_ENDPOINT_URL?.trim() ?? process.env.S3_ENDPOINT_URL?.trim();
  const prefix = process.env.S3_PREFIX?.trim() ?? '';

  const args = buildAwsS3SyncArgs({
    dryRun: flags.dryRun,
    deleteRemote: flags.deleteRemote,
    bucket,
    endpointUrl,
    prefix,
    publicDir,
  });

  const label = flags.dryRun ? 'DRY-RUN' : flags.deleteRemote ? 'SYNC+DELETE' : 'SYNC';
  process.stdout.write(
    `${label}: aws ${args.join(' ')}\n` +
      `Scope: public/ → ${buildS3SyncTarget(bucket, prefix)} (excludes fonts/)\n`
  );

  const result = spawnSync('aws', args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    return false;
  }
  return true;
}

function verifySampleUrls() {
  const publicBase =
    process.env.S3_PUBLIC_BASE_URL?.trim() ??
    process.env.VITE_PUBLIC_ASSET_BASE_URL?.trim();
  if (!publicBase) {
    throw new Error(
      'Set S3_PUBLIC_BASE_URL or VITE_PUBLIC_ASSET_BASE_URL for --verify-sample'
    );
  }

  process.stdout.write(`HEAD check (sample objects) against ${publicBase}\n`);
  let failures = 0;

  for (const key of S3_VERIFY_SAMPLE_KEYS) {
    const url = buildPublicObjectUrl(publicBase, key);
    const curl = spawnSync(
      'curl',
      ['-sI', '-o', 'NUL', '-w', '%{http_code}', url],
      { encoding: 'utf8', shell: true }
    );
    const status = (curl.stdout ?? '').trim() || String(curl.status ?? 'err');
    const ok = status === '200';
    process.stdout.write(`${ok ? 'OK' : 'FAIL'} ${status} ${url}\n`);
    if (!ok) {
      failures += 1;
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/sync-public-to-s3.mjs [options]

Options:
  --dry-run         aws s3 sync --dryrun (no upload)
  --delete          Pass --delete to aws (removes extra objects in bucket — dangerous)
  --verify-sample   curl -I on ${S3_VERIFY_SAMPLE_KEYS.length} canonical URLs after sync

Env (see TimeWebDoc/examples/s3.env.example):
  S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  AWS_ENDPOINT_URL or S3_ENDPOINT_URL (TimeWeb)
  S3_PREFIX (optional)
  S3_PUBLIC_BASE_URL (for verify; usually = VITE_PUBLIC_ASSET_BASE_URL)

npm scripts:
  npm run sync:s3:dry-run
  npm run sync:s3
`);
}

function main() {
  const flags = parseFlags(process.argv.slice(2));
  if (flags.help) {
    printHelp();
    return;
  }

  if (flags.deleteRemote) {
    process.stderr.write(
      'WARNING: --delete removes S3 objects not present in public/. Confirm bucket before use.\n'
    );
  }

  try {
    if (flags.verifySample) {
      verifySampleUrls();
      return;
    }

    assertAwsCliAvailable();
    const ok = runAwsSync(flags);
    if (!ok) {
      return;
    }

    process.stdout.write(
      'Done. Set VITE_PUBLIC_ASSET_BASE_URL on web-vkr to the public bucket/CDN origin.\n'
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

const isCliEntry =
  process.argv[1] != null &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCliEntry) {
  main();
}
