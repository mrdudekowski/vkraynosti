import {
  HeadBucketCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import { loadCmsApiEnv } from './api/env.ts';

const ORIGINAL_BUCKET = '1beb22d2-76b9-47e6-bbf0-5c9cc8d51ea7';

const PREFIXES = [
  'tours/summer-14/',
  'media/tours/summer-14/',
  'vkraynosti/tours/summer-14/',
  'published/tours/summer-14/',
  'draft/tours/summer-14/',
] as const;

async function listPrefix(
  client: S3Client,
  bucket: string,
  prefix: string,
  max = 200
): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: token,
        MaxKeys: 200,
      })
    );
    for (const item of page.Contents ?? []) {
      if (item.Key != null) {
        keys.push(item.Key);
      }
      if (keys.length >= max) {
        return keys;
      }
    }
    token = page.NextContinuationToken;
  } while (token != null && keys.length < max);
  return keys;
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

  try {
    await client.send(new HeadBucketCommand({ Bucket: ORIGINAL_BUCKET }));
    console.info(`HeadBucket OK: ${ORIGINAL_BUCKET}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`HeadBucket FAIL: ${message}`);
    process.exitCode = 1;
    return;
  }

  for (const prefix of PREFIXES) {
    const keys = await listPrefix(client, ORIGINAL_BUCKET, prefix);
    console.info(`\n[${prefix}] count=${keys.length}`);
    for (const key of keys) {
      console.info(`  ${key}`);
    }
  }

  const sampleRoots = ['', 'tours/', 'media/', 'published/', 'draft/', 'vkraynosti/'];
  console.info('\n=== sample keys (up to 8 per prefix) ===');
  for (const prefix of sampleRoots) {
    const keys = await listPrefix(client, ORIGINAL_BUCKET, prefix, 8);
    console.info(`${prefix || '(root)'}: ${keys.length > 0 ? keys.join(', ') : '(empty)'}`);
  }

  const summer14Expected = [
    'tours/summer-14/island.webp',
    'tours/summer-14/grove.webp',
    'tours/summer-14/cove.webp',
    'tours/summer-14/spit.webp',
    'tours/summer-14/trail-group.webp',
    'tours/summer-14/cliffs.webp',
    'tours/summer-14/sunset-pier.webp',
    'tours/summer-14/boardwalk.webp',
  ];
  const listed = await listPrefix(client, ORIGINAL_BUCKET, 'tours/summer-14/', 50);
  const listedSet = new Set(listed);
  console.info('\n=== summer-14 expected vs listed ===');
  for (const key of summer14Expected) {
    console.info(`${listedSet.has(key) ? 'OK' : 'MISSING'} ${key}`);
  }
}

await main();
