/**
 * Copies the broken extensionless Elena photo to a CDN-servable key and
 * rewrites draft/published team documents to that CDN URL.
 *
 * Usage: npx tsx scripts/cms/repair-team-photo-key.ts
 */
import { loadCmsApiEnv } from './api/env.ts';
import { createS3JsonStore } from './api/store.ts';
import { siteContentDraftKey, siteContentPublishedKey } from '../../src/cms/siteContentPackageKeys.ts';

const ASSET_ID = '1ffaa643-b261-4cd1-aae1-4398c317298b';
const LEGACY_KEY = `media/site-content/team${ASSET_ID}`;
const CANONICAL_KEY = `media/site-content/team/${ASSET_ID}.jpg`;
const CDN_URL = `https://ypnmfvotln.cdn.twcstorage.ru/${CANONICAL_KEY}`;
const LEGACY_URLS = [
  `https://ypnmfvotln.cdn.twcstorage.ru/${LEGACY_KEY}`,
  `https://s3.twcstorage.ru/vkraynosti-cms-dev/${LEGACY_KEY}`,
];

function rewriteUrls(value: unknown): unknown {
  if (typeof value === 'string') {
    return LEGACY_URLS.includes(value) ? CDN_URL : value;
  }
  if (Array.isArray(value)) return value.map(rewriteUrls);
  if (value != null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteUrls(item)]));
  }
  return value;
}

async function main(): Promise<void> {
  const env = await loadCmsApiEnv(process.cwd());
  if (env.storeKind !== 's3') throw new Error('CMS_STORE=s3 is required');
  const store = createS3JsonStore(env.s3);
  const source = await store.getBytes(LEGACY_KEY);
  if (source == null) throw new Error(`Missing source object ${LEGACY_KEY}`);
  await store.putBytes(CANONICAL_KEY, source.body, source.contentType ?? 'image/jpeg');
  for (const key of [siteContentDraftKey('team'), siteContentPublishedKey('team')]) {
    const document = await store.getJson(key);
    if (document == null) continue;
    await store.putJson(key, rewriteUrls(document));
  }
  console.info(JSON.stringify({ copied: CANONICAL_KEY, url: CDN_URL }, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
