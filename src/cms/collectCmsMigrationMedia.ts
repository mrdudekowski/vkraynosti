import type { CmsTourAsset, CmsTourDocument } from './cmsTourDocument';
import { cmsObjectKeyFromPublicUrl } from './siteTourToCmsDocument';

export type CmsMigrationMediaObject = {
  sourceUrl: string;
  key: string;
};

function mediaRowsForAsset(
  source: CmsTourAsset,
  target: CmsTourAsset,
  publicBaseUrl: string
): CmsMigrationMediaObject[] {
  const rows: CmsMigrationMediaObject[] = [
    {
      sourceUrl: source.stillUrl,
      key: cmsObjectKeyFromPublicUrl(target.stillUrl, publicBaseUrl),
    },
  ];
  if (source.videoUrl != null && target.videoUrl != null) {
    rows.push({
      sourceUrl: source.videoUrl,
      key: cmsObjectKeyFromPublicUrl(target.videoUrl, publicBaseUrl),
    });
  }
  return rows;
}

export function collectCmsMigrationMedia(
  original: CmsTourDocument,
  rewritten: CmsTourDocument,
  publicBaseUrl: string
): CmsMigrationMediaObject[] {
  const originalById = new Map(original.assets.map((asset) => [asset.id, asset]));
  const rows: CmsMigrationMediaObject[] = [];

  for (const asset of rewritten.assets) {
    const source = originalById.get(asset.id);
    if (source == null) {
      continue;
    }
    rows.push(...mediaRowsForAsset(source, asset, publicBaseUrl));
  }

  return rows;
}

export function dedupeCmsMigrationMedia(
  items: readonly CmsMigrationMediaObject[]
): CmsMigrationMediaObject[] {
  const seen = new Set<string>();
  const unique: CmsMigrationMediaObject[] = [];
  for (const item of items) {
    const token = `${item.sourceUrl}\0${item.key}`;
    if (seen.has(token)) {
      continue;
    }
    seen.add(token);
    unique.push(item);
  }
  return unique;
}
