/**
 * S3 mirror scope: same keys as paths under public/, except App-only fonts.
 * @see TimeWebDoc/audit-phase2-inventory.json → s3ScopeNote
 */
import path from 'node:path';

/** AWS CLI --exclude patterns (relative to `public/`). */
export const S3_SYNC_EXCLUDE_PATTERNS = [
  'fonts/*',
  '**/desktop.ini',
];

/** Sample object keys for post-sync HEAD checks (Phase 4). */
export const S3_VERIFY_SAMPLE_KEYS = [
  'tours/fall-1/cover.webp',
  'tours/spring-1/hero.webp',
  'team/team-1.webp',
  'safety/safety.webp',
  'banners_spring/spring.webp',
];

/**
 * @param {string} repoRelativePath e.g. `public/tours/fall-1/cover.webp`
 * @returns {string | null} S3 object key e.g. `tours/fall-1/cover.webp`
 */
export function publicPathToObjectKey(repoRelativePath) {
  const normalized = repoRelativePath.replace(/\\/g, '/');
  if (!normalized.startsWith('public/')) {
    return null;
  }
  const key = normalized.slice('public/'.length);
  if (!key || key.includes('..')) {
    return null;
  }
  if (key.startsWith('fonts/')) {
    return null;
  }
  return key;
}

/**
 * @param {string} publicBaseUrl origin with or without trailing slash
 * @param {string} objectKey e.g. `tours/fall-1/cover.webp`
 */
export function buildPublicObjectUrl(publicBaseUrl, objectKey) {
  const base = publicBaseUrl.endsWith('/') ? publicBaseUrl : `${publicBaseUrl}/`;
  return `${base}${objectKey}`;
}

function normalizePrefix(prefix) {
  if (!prefix) {
    return '';
  }
  const trimmed = prefix.replace(/^\/+|\/+$/g, '');
  return trimmed ? `${trimmed}/` : '';
}

export function buildS3SyncTarget(bucket, prefix) {
  const normalizedPrefix = normalizePrefix(prefix);
  return `s3://${bucket}/${normalizedPrefix}`;
}

/**
 * @param {{ dryRun: boolean; deleteRemote: boolean; bucket: string; endpointUrl?: string; prefix?: string; publicDir: string }} options
 */
export function buildAwsS3SyncArgs(options) {
  const { dryRun, deleteRemote, bucket, endpointUrl, prefix, publicDir } = options;
  const target = buildS3SyncTarget(bucket, prefix ?? '');
  const source = `${publicDir}${path.sep}`;

  const args = [
    's3',
    'sync',
    source,
    target,
    '--cache-control',
    'public,max-age=31536000,immutable',
    '--only-show-errors',
  ];

  for (const pattern of S3_SYNC_EXCLUDE_PATTERNS) {
    args.push('--exclude', pattern);
  }

  if (endpointUrl) {
    args.push('--endpoint-url', endpointUrl);
  }
  if (dryRun) {
    args.push('--dryrun');
  }
  if (deleteRemote) {
    args.push('--delete');
  }

  return args;
}
