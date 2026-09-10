import { HeadBucketCommand, ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { loadCmsApiEnv } from './api/env.ts';

const rootDir = process.cwd();

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(rootDir);
  const client = new S3Client({
    region: env.s3.region,
    endpoint: env.s3.endpoint,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: {
      accessKeyId: env.s3.accessKey,
      secretAccessKey: env.s3.secretKey,
    },
  });

  console.info(`endpoint=${env.s3.endpoint}`);
  console.info(`configured bucket=${env.s3.bucket}`);

  try {
    const listed = await client.send(new ListBucketsCommand({}));
    console.info('Buckets visible to your key:');
    for (const bucket of listed.Buckets ?? []) {
      console.info(` - ${bucket.Name ?? '(unnamed)'}`);
    }
    if ((listed.Buckets ?? []).length === 0) {
      console.info(' (empty list)');
    }
  } catch (error) {
    const name = error instanceof Error ? error.name : String(error);
    console.info(`ListBuckets failed: ${name}`);
  }

  try {
    await client.send(new HeadBucketCommand({ Bucket: env.s3.bucket }));
    console.info(`HeadBucket OK for ${env.s3.bucket}`);
  } catch (error) {
    const name = error instanceof Error ? error.name : String(error);
    console.info(`HeadBucket FAILED for ${env.s3.bucket}: ${name}`);
  }
}

await main();
