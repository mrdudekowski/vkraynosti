import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { loadCmsApiEnv } from './api/env.ts';

const PRODUCTION_BUCKET = '1beb22d2-76b9-47e6-bbf0-5c9cc8d51ea7';

const SITE_MEDIA_KEYS = [
  'team/team-1.webp',
  'team/team-2.webp',
  'team/team-3.webp',
  'team/team-4.webp',
  'safety/safety.webp',
  'safety/safetyback.webp',
] as const;

function contentTypeFor(key: string): string {
  if (key.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

async function objectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function copyObject(
  client: S3Client,
  sourceBucket: string,
  destBucket: string,
  key: string
): Promise<void> {
  try {
    await client.send(
      new CopyObjectCommand({
        Bucket: destBucket,
        Key: key,
        CopySource: `${sourceBucket}/${key}`,
        ContentType: contentTypeFor(key),
        CacheControl: 'public, max-age=86400',
      })
    );
    return;
  } catch {
    /* fallback: read + put (some S3-compatible stores reject CopySource cross-bucket) */
  }

  const object = await client.send(
    new GetObjectCommand({ Bucket: sourceBucket, Key: key })
  );
  const body = await object.Body?.transformToByteArray();
  if (body == null) {
    throw new Error(`Empty body for ${sourceBucket}/${key}`);
  }
  await client.send(
    new PutObjectCommand({
      Bucket: destBucket,
      Key: key,
      Body: body,
      ContentType: contentTypeFor(key),
      CacheControl: 'public, max-age=86400',
    })
  );
}

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(process.cwd());
  if (env.storeKind !== 's3') {
    throw new Error('cms:sync-site-media requires CMS_STORE=s3 in .env.cms-dev');
  }

  const client = new S3Client({
    region: env.s3.region,
    endpoint: env.s3.endpoint,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: {
      accessKeyId: env.s3.accessKey,
      secretAccessKey: env.s3.secretKey,
    },
  });

  console.info(`source: ${PRODUCTION_BUCKET}`);
  console.info(`dest:   ${env.s3.bucket}`);

  let copied = 0;
  let skipped = 0;

  for (const key of SITE_MEDIA_KEYS) {
    if (!(await objectExists(client, PRODUCTION_BUCKET, key))) {
      skipped += 1;
      console.warn(`skip (missing on prod): ${key}`);
      continue;
    }
    await copyObject(client, PRODUCTION_BUCKET, env.s3.bucket, key);
    copied += 1;
    console.info(`copied ${key}`);
  }

  console.info(`done: ${copied} copied, ${skipped} skipped`);
  if (skipped > 0) {
    process.exitCode = 1;
  }
}

await main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
