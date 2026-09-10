import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
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

  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: env.s3.bucket, ContinuationToken: token })
    );
    for (const item of page.Contents ?? []) {
      if (item.Key?.includes('document.json')) keys.push(item.Key);
    }
    token = page.NextContinuationToken;
  } while (token != null);

  for (const key of keys) {
    const object = await client.send(new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }));
    const text = await object.Body?.transformToString();
    if (text == null) continue;
    const doc = JSON.parse(text) as { id?: string; slug?: string; title?: string };
    if (doc.slug === 'ostrov-petrova' || doc.title?.includes('Петров')) {
      console.info(key, doc.id, doc.title, doc.slug);
    }
  }
}

void main();
