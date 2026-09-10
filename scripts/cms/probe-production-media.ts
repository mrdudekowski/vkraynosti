import {
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { loadCmsApiEnv } from './api/env.ts';

const PRODUCTION_BUCKET = '1beb22d2-76b9-47e6-bbf0-5c9cc8d51ea7';
const PUBLIC_BASE = `https://s3.twcstorage.ru/${PRODUCTION_BUCKET}`;

const MISSING_MIGRATION_FILES = [
  ['fall-12', 'preface.webp'],
  ['fall-12', 'tob.clip1.poster.webp'],
  ['fall-12', 'tob.clip1.grid.webm'],
  ['fall-12', '1.webp'],
  ['fall-12', 'tob.clip2.poster.webp'],
  ['fall-12', 'tob.clip2.grid.webm'],
  ['fall-12', '2.webp'],
  ['fall-12', 'tob.clip3.poster.webp'],
  ['fall-12', 'tob.clip3.grid.webm'],
  ['fall-12', '3.webp'],
  ['fall-12', 'tob.clip4.poster.webp'],
  ['fall-12', 'tob.clip4.grid.webm'],
  ['fall-12', '4.webp'],
  ['fall-12', 'tob.clip5.poster.webp'],
  ['fall-12', 'tob.clip5.grid.webm'],
  ['summer-12', 'cover.webp'],
  ['summer-12', 'preface.webp'],
  ['summer-12', 'beach.webp'],
  ['summer-12', 'camp.webp'],
  ['summer-12', 'cliff.webp'],
  ['summer-12', 'sunset.webp'],
  ['summer-12', 'nazimova.webp'],
] as const;

const TEAM_FILES = ['team/team-1.webp', 'team/team-2.webp', 'team/team-3.webp', 'team/team-4.webp'] as const;

const SAFETY_FILES = [
  'safety/safety.webp',
  'safety/safetyback.webp',
  'tours/winter-3/gr.instr.webp',
] as const;

async function headObject(
  client: S3Client,
  key: string
): Promise<{ ok: boolean; size?: number }> {
  try {
    const response = await client.send(
      new HeadObjectCommand({ Bucket: PRODUCTION_BUCKET, Key: key })
    );
    return { ok: true, size: response.ContentLength };
  } catch {
    return { ok: false };
  }
}

async function listPrefix(client: S3Client, prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: PRODUCTION_BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 500,
      })
    );
    for (const item of page.Contents ?? []) {
      if (item.Key != null) {
        keys.push(item.Key);
      }
    }
    token = page.NextContinuationToken;
  } while (token != null);
  return keys;
}

async function publicHead(key: string): Promise<{ ok: boolean; size?: number }> {
  try {
    const response = await fetch(`${PUBLIC_BASE}/${key}`, { method: 'HEAD', cache: 'no-store' });
    if (!response.ok) {
      return { ok: false };
    }
    const len = response.headers.get('content-length');
    return { ok: true, size: len != null ? Number(len) : undefined };
  } catch {
    return { ok: false };
  }
}

function formatSize(size: number | undefined): string {
  if (size == null || Number.isNaN(size)) {
    return '?';
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(size / 1024)} KB`;
}

async function checkGroup(
  client: S3Client,
  title: string,
  keys: readonly string[]
): Promise<{ found: number; missing: string[] }> {
  console.info(`\n=== ${title} ===`);
  const missing: string[] = [];
  for (const key of keys) {
    const s3 = await headObject(client, key);
    const pub = s3.ok ? s3 : await publicHead(key);
    if (pub.ok) {
      console.info(`  OK  ${key} (${formatSize(pub.size)})`);
    } else {
      console.info(`  MISS ${key}`);
      missing.push(key);
    }
  }
  console.info(`  → ${keys.length - missing.length}/${keys.length} found`);
  return { found: keys.length - missing.length, missing };
}

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(process.cwd());
  const client = new S3Client({
    region: env.s3.region,
    endpoint: env.s3.endpoint,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: {
      accessKeyId: env.s3.accessKey,
      secretAccessKey: env.s3.secretKey,
    },
  });

  await client.send(new HeadBucketCommand({ Bucket: PRODUCTION_BUCKET }));
  console.info(`Production bucket: ${PRODUCTION_BUCKET}`);

  const migrationKeys = MISSING_MIGRATION_FILES.map(([tourId, file]) => `tours/${tourId}/${file}`);
  const migration = await checkGroup(client, '22 missing migration files', migrationKeys);

  const team = await checkGroup(client, 'Team portraits', TEAM_FILES);
  const safety = await checkGroup(client, 'Safety covers', SAFETY_FILES);

  for (const prefix of ['tours/fall-12/', 'tours/summer-12/', 'tours/spring-12/', 'team/', 'safety/']) {
    const keys = await listPrefix(client, prefix);
    console.info(`\n=== folder listing: ${prefix} (${keys.length} objects) ===`);
    for (const key of keys.sort()) {
      console.info(`  ${key.replace(prefix, '')}`);
    }
  }

  console.info('\n=== summary ===');
  console.info(`migration recoverable on prod: ${migration.found}/22`);
  console.info(`team on prod: ${team.found}/4`);
  console.info(`safety on prod: ${safety.found}/3`);
  if (migration.missing.length > 0) {
    console.info('still missing on prod bucket:');
    for (const key of migration.missing) {
      console.info(`  - ${key}`);
    }
  }
}

await main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
