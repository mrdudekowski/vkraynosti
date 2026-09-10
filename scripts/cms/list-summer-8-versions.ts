import { GetObjectCommand, ListObjectVersionsCommand, S3Client } from '@aws-sdk/client-s3';
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

  const key = 'draft/tours/summer-8/document.json';
  const versions = await client.send(
    new ListObjectVersionsCommand({ Bucket: env.s3.bucket, Prefix: key })
  );

  console.info('Versions for', key);
  for (const version of versions.Versions ?? []) {
    console.info(
      version.LastModified?.toISOString(),
      'latest=',
      version.IsLatest,
      'size=',
      version.Size,
      'id=',
      version.VersionId
    );
    if (version.VersionId == null) continue;
    const object = await client.send(
      new GetObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
        VersionId: version.VersionId,
      })
    );
    const text = await object.Body?.transformToString();
    if (text == null) continue;
    const doc = JSON.parse(text) as { title?: string; slug?: string };
    console.info('  title:', doc.title, 'slug:', doc.slug);
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
