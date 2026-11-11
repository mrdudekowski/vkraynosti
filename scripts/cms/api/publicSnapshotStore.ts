import {
  CMS_PUBLISHED_CATALOG_KEY,
  CMS_PUBLISHED_SCHEDULE_KEY,
  CMS_PUBLISHED_TOURS_LIST_KEY,
  cmsMediaObjectKeyFromPublicUrl,
} from '../../../src/cms/cmsPackageKeys.ts';
import { SITE_CONTENT_KINDS } from '../../../src/cms/siteContentDocument.ts';
import { siteContentPublishedKey } from '../../../src/cms/siteContentPackageKeys.ts';
import { parseSiteSeoDocument } from '../../../src/cms/siteSeoDocument.ts';
import type { CmsTourDocument } from '../../../src/cms/cmsTourDocument.ts';
import { createPublicSnapshotRelease, serializeCanonicalJson } from '../../../src/cms/publicSnapshotRelease.ts';
import type { PublicSnapshotRelease } from '../../../src/cms/publicSnapshotSchema.ts';
import type { CmsJsonStore } from './store.ts';

const RELEASE_SITE_CONTENT_KINDS = [
  ...SITE_CONTENT_KINDS,
  'policy-offer-and-safety',
  'policy-payment-cancellation-refund',
  'policy-personal-data-policy',
  'policy-personal-data-consent',
] as const;

export class PublicSnapshotConflictError extends Error {
  constructor() {
    super('Published CMS data changed while the release snapshot was being read');
    this.name = 'PublicSnapshotConflictError';
  }
}

type SnapshotOptions = {
  sourceKind: string;
  generatedAt?: string;
  readAttempts?: number;
};

function snapshotKeys(): Array<{ key: string; siteContentKind?: string }> {
  return [
    { key: CMS_PUBLISHED_CATALOG_KEY },
    { key: CMS_PUBLISHED_TOURS_LIST_KEY },
    { key: CMS_PUBLISHED_SCHEDULE_KEY },
    ...RELEASE_SITE_CONTENT_KINDS.map((kind) => ({
      key: kind === 'seo'
        ? siteContentPublishedKey('seo')
        : `published/site-content/${kind}/document.json`,
      siteContentKind: kind,
    })),
  ];
}

async function readPass(store: CmsJsonStore, keys: ReturnType<typeof snapshotKeys>): Promise<unknown[]> {
  const values: unknown[] = [];
  for (const { key } of keys) values.push(await store.getJson(key));
  return values;
}

function assembleSnapshot(keys: ReturnType<typeof snapshotKeys>, values: unknown[]) {
  const byKey = new Map(keys.map(({ key }, index) => [key, values[index]]));
  const tours = byKey.get(CMS_PUBLISHED_CATALOG_KEY);
  const catalogTours =
    typeof tours === 'object' && tours != null && Array.isArray((tours as { tours?: unknown }).tours)
      ? (tours as { tours: CmsTourDocument[] }).tours
      : [];
  const stills: Array<{ key: string; url: string }> = [];
  const seenStills = new Set<string>();
  for (const tour of catalogTours) {
    for (const assetId of [tour.coverAssetId, tour.prefaceAssetId]) {
      const asset = tour.assets?.find((item) => item.id === assetId);
      if (asset?.stillUrl == null || asset.stillUrl.length === 0) continue;
      const key = cmsMediaObjectKeyFromPublicUrl(tour.id, asset.stillUrl);
      if (key == null || seenStills.has(key)) continue;
      seenStills.add(key);
      stills.push({ key, url: asset.stillUrl });
    }
  }

  const siteContent = Object.fromEntries(
    keys.flatMap(({ siteContentKind }, index) =>
      siteContentKind == null
        ? []
        : [[
            siteContentKind,
            siteContentKind === 'seo' && values[index] != null
              ? parseSiteSeoDocument(values[index])
              : values[index],
          ]],
    ),
  );
  return {
    schemaVersion: 1,
    tours,
    toursList: byKey.get(CMS_PUBLISHED_TOURS_LIST_KEY),
    schedule: byKey.get(CMS_PUBLISHED_SCHEDULE_KEY),
    siteContent,
    stills,
  };
}

export async function loadPublicSnapshotRelease(
  store: CmsJsonStore,
  options: SnapshotOptions,
): Promise<PublicSnapshotRelease> {
  const keys = snapshotKeys();
  const attempts = Math.max(1, Math.min(5, options.readAttempts ?? 3));
  let stableValues: unknown[] | undefined;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const first = await readPass(store, keys);
    const second = await readPass(store, keys);
    if (serializeCanonicalJson(first) === serializeCanonicalJson(second)) {
      stableValues = second;
      break;
    }
  }

  if (stableValues == null) throw new PublicSnapshotConflictError();
  return createPublicSnapshotRelease(assembleSnapshot(keys, stableValues), {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    sourceKind: options.sourceKind,
  });
}
