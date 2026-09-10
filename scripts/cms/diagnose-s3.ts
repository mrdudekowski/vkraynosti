import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { loadCmsApiEnv, readDotEnvFile } from './api/env.ts';

const rootDir = process.cwd();

async function diagnoseEnvFile(): Promise<void> {
  const filePath = path.join(rootDir, '.env.cms-dev');
  const raw = await readFile(filePath, 'utf8');
  const hasBom = raw.charCodeAt(0) === 0xfeff;
  console.info(`env file bytes=${Buffer.byteLength(raw, 'utf8')} bom=${hasBom}`);

  const fileEnv = await readDotEnvFile(filePath);
  const pairs = [
    ['AWS_ACCESS_KEY_ID', fileEnv.AWS_ACCESS_KEY_ID],
    ['AWS_SECRET_ACCESS_KEY', fileEnv.AWS_SECRET_ACCESS_KEY],
    ['S3_ACCESS_KEY', fileEnv.S3_ACCESS_KEY],
    ['S3_SECRET_KEY', fileEnv.S3_SECRET_KEY],
    ['S3_BUCKET', fileEnv.S3_BUCKET],
    ['S3_ENDPOINT', fileEnv.S3_ENDPOINT],
    ['CMS_STORE', fileEnv.CMS_STORE],
  ] as const;

  for (const [name, value] of pairs) {
    if (value == null || value.length === 0) {
      console.info(`${name}: (empty)`);
      continue;
    }
    const trimmed = value.trim();
    const suspicious =
      trimmed !== value ||
      /[\u200B-\u200D\uFEFF]/.test(value) ||
      value.includes('\r') ||
      value.includes('\n');
    console.info(
      `${name}: len=${value.length} trimmed=${trimmed.length} suspicious=${suspicious}`
    );
  }

  const accessA = fileEnv.AWS_ACCESS_KEY_ID ?? '';
  const secretA = fileEnv.AWS_SECRET_ACCESS_KEY ?? '';
  const accessS = fileEnv.S3_ACCESS_KEY ?? '';
  const secretS = fileEnv.S3_SECRET_KEY ?? '';
  const resolvedAccess = accessS.length > 0 ? accessS : accessA;
  const resolvedSecret = secretS.length > 0 ? secretS : secretA;
  const accessSource = accessS.length > 0 ? 'S3_ACCESS_KEY' : 'AWS_ACCESS_KEY_ID';
  const secretSource = secretS.length > 0 ? 'S3_SECRET_KEY' : 'AWS_SECRET_ACCESS_KEY';
  console.info(`resolved pair: access=${accessSource} secret=${secretSource}`);
  if (accessS.length > 0 && secretS.length === 0 && accessS !== accessA) {
    console.info(
      'WARNING: S3_ACCESS_KEY without S3_SECRET_KEY — API will use AWS_* pair if both are set (avoid mixing key from one pair with secret from another)'
    );
  }
  if (accessS.length > 0 && secretS.length === 0 && accessS === accessA && secretA.length > 0) {
    console.info('NOTE: duplicate access key in S3_ACCESS_KEY and AWS_ACCESS_KEY_ID — OK if secret matches');
  }
  if (resolvedAccess.length === 0 || resolvedSecret.length === 0) {
    console.info('WARNING: incomplete credential pair');
  }
}

async function tryClient(label: string, accessKey: string, secretKey: string, bucket: string, endpoint: string, region: string, forcePathStyle: boolean): Promise<boolean> {
  if (accessKey.length === 0 || secretKey.length === 0) {
    console.info(`${label}: skip (incomplete pair)`);
    return false;
  }
  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
  });
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: 'private/__cms_probe.json',
        Body: '{"ok":true}\n',
        ContentType: 'application/json',
      })
    );
    console.info(`${label}: PutObject OK`);
    return true;
  } catch (error) {
    const name = error instanceof Error ? error.name : String(error);
    const code = error != null && typeof error === 'object' && 'Code' in error ? String(error.Code) : '';
    console.info(`${label}: PutObject FAIL ${name}${code ? ` (${code})` : ''}`);
    return false;
  }
}

async function main(): Promise<void> {
  await diagnoseEnvFile();
  const env = await loadCmsApiEnv(rootDir);
  const fileEnv = await readDotEnvFile(path.join(rootDir, '.env.cms-dev'));

  console.info(`loaded store=${env.storeKind} bucket=${env.s3.bucket} endpoint=${env.s3.endpoint}`);
  console.info(`region=${env.s3.region} forcePathStyle=${env.s3.forcePathStyle}`);

  await tryClient(
    'AWS pair',
    fileEnv.AWS_ACCESS_KEY_ID ?? '',
    fileEnv.AWS_SECRET_ACCESS_KEY ?? '',
    env.s3.bucket,
    env.s3.endpoint,
    env.s3.region,
    env.s3.forcePathStyle
  );
  await tryClient(
    'S3 pair',
    fileEnv.S3_ACCESS_KEY ?? '',
    fileEnv.S3_SECRET_KEY ?? '',
    env.s3.bucket,
    env.s3.endpoint,
    env.s3.region,
    env.s3.forcePathStyle
  );
  await tryClient(
    'resolved (API)',
    env.s3.accessKey,
    env.s3.secretKey,
    env.s3.bucket,
    env.s3.endpoint,
    env.s3.region,
    env.s3.forcePathStyle
  );
}

await main();
