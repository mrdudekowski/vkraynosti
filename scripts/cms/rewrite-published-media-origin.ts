/**
 * Rewrites only the public origin in existing CMS JSON documents.
 *
 * Why this exists: S3_PUBLIC_BASE_URL affects newly created media URLs, but
 * published documents already contain absolute media URLs. This migration
 * preserves every object key and document field, replacing only the exact old
 * S3 prefix. It defaults to dry-run; --apply creates a private S3 backup first.
 *
 * Usage:
 *   npx tsx scripts/cms/rewrite-published-media-origin.ts --target https://cdn.example/
 *   npx tsx scripts/cms/rewrite-published-media-origin.ts --target https://cdn.example/ --apply
 */
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { loadCmsApiEnv } from './api/env.ts';
import { createS3JsonStore } from './api/store.ts';

const rootDir = process.cwd();
const apply = process.argv.includes('--apply');
const OLD_PUBLIC_PREFIX = 'https://s3.twcstorage.ru/vkraynosti-cms-dev';
const KEY_PREFIXES = ['published/', 'draft/tours/'] as const;

function argumentValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] ?? null : null;
}

type MigrationStats = {
  jsonObjects: number;
  changedObjects: number;
  replacements: number;
  changedKeys: string[];
};

function replaceOrigin(value: unknown, from: string, to: string): { value: unknown; replacements: number } {
  if (typeof value === 'string') {
    const replacements = value.split(from).length - 1;
    return { value: replacements === 0 ? value : value.replaceAll(from, to), replacements };
  }
  if (Array.isArray(value)) {
    let replacements = 0;
    const next = value.map((item) => {
      const rewritten = replaceOrigin(item, from, to);
      replacements += rewritten.replacements;
      return rewritten.value;
    });
    return { value: replacements === 0 ? value : next, replacements };
  }
  if (value != null && typeof value === 'object') {
    let replacements = 0;
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      const rewritten = replaceOrigin(item, from, to);
      replacements += rewritten.replacements;
      next[key] = rewritten.value;
    }
    return { value: replacements === 0 ? value : next, replacements };
  }
  return { value, replacements: 0 };
}

async function listJsonKeys(client: S3Client, bucket: string, prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }),
    );
    for (const item of page.Contents ?? []) {
      if (item.Key?.endsWith('.json')) keys.push(item.Key);
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken != null);
  return keys;
}

async function getJson(client: S3Client, bucket: string, key: string): Promise<unknown> {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const text = await response.Body?.transformToString();
  if (text == null || text.length === 0) throw new Error(`Empty JSON object: ${key}`);
  return JSON.parse(text) as unknown;
}

async function mapConcurrent<T, R>(
  values: readonly T[],
  limit: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const output = new Array<R>(values.length);
  let nextIndex = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, async () => {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= values.length) return;
        output[index] = await worker(values[index]!);
      }
    }),
  );
  return output;
}

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(rootDir);
  if (env.storeKind !== 's3') throw new Error('CMS_STORE=s3 is required');

  const targetArgument = argumentValue('--target');
  if (targetArgument == null) {
    throw new Error('Pass the new CDN origin explicitly: --target https://your-cdn.example/');
  }
  const targetPrefix = targetArgument.replace(/\/+$/, '');
  if (!targetPrefix.startsWith('https://') || targetPrefix === OLD_PUBLIC_PREFIX) {
    throw new Error(`--target must be the new HTTPS CDN origin; got ${targetPrefix}`);
  }

  const client = new S3Client({
    region: env.s3.region,
    endpoint: env.s3.endpoint,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: { accessKeyId: env.s3.accessKey, secretAccessKey: env.s3.secretKey },
  });
  const store = createS3JsonStore(env.s3);
  console.info(`scanning JSON objects in ${env.s3.bucket}…`);
  const listed = await Promise.all(KEY_PREFIXES.map((prefix) => listJsonKeys(client, env.s3.bucket, prefix)));
  const keys = [...new Set(listed.flat())].filter((key) => !key.startsWith('private/backups/')).sort();
  console.info(`scanning ${keys.length} JSON objects for the old public origin…`);
  const stats: MigrationStats = { jsonObjects: keys.length, changedObjects: 0, replacements: 0, changedKeys: [] };
  const changes: Array<{ key: string; original: unknown; rewritten: unknown }> = [];

  const originals = await mapConcurrent(keys, 12, (key) => getJson(client, env.s3.bucket, key));
  for (const [index, key] of keys.entries()) {
    const original = originals[index]!;
    const result = replaceOrigin(original, OLD_PUBLIC_PREFIX, targetPrefix);
    if (result.replacements === 0) continue;
    stats.changedObjects += 1;
    stats.replacements += result.replacements;
    stats.changedKeys.push(key);
    changes.push({ key, original, rewritten: result.value });
  }

  console.info(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', from: OLD_PUBLIC_PREFIX, to: targetPrefix, ...stats }, null, 2));
  if (!apply) return;
  if (changes.length === 0) return;

  const backupId = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPrefix = `private/backups/cdn-origin-rewrite/${backupId}`;
  await mapConcurrent(changes, 12, (change) =>
    store.putJson(`${backupPrefix}/${change.key}`, change.original),
  );
  console.info(`backup written: ${backupPrefix} (${changes.length} objects)`);

  // Documents first, public aggregate catalog last: guest traffic remains coherent.
  const ordered = [...changes].sort((a, b) => {
    if (a.key === 'published/tours.json') return 1;
    if (b.key === 'published/tours.json') return -1;
    return a.key.localeCompare(b.key);
  });
  const catalog = ordered.at(-1)!;
  await mapConcurrent(ordered.slice(0, -1), 12, (change) => store.putJson(change.key, change.rewritten));
  await store.putJson(catalog.key, catalog.rewritten);
  console.info(`rewritten ${changes.length} JSON objects; published/tours.json was written last`);
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
