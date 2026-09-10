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
      if (item.Key?.endsWith('.json')) keys.push(item.Key);
    }
    token = page.NextContinuationToken;
  } while (token != null);

  const hits: Array<{ key: string; title?: string }> = [];
  for (const key of keys) {
    const object = await client.send(new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }));
    const text = await object.Body?.transformToString();
    if (text == null || !text.includes('Петров')) continue;
    let title: string | undefined;
    try {
      title = (JSON.parse(text) as { title?: string }).title;
    } catch {
      /* aggregate json */
    }
    hits.push({ key, title });
  }

  console.info('JSON keys with "Петров":', hits.length);
  for (const hit of hits) {
    console.info(hit.key, hit.title ?? '(nested)');
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
