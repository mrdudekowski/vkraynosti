import type { CmsTourDocument } from './cmsTourDocument';

export function cmsTourCoverUrl(document: CmsTourDocument): string | null {
  if (document.coverAssetId == null || document.coverAssetId.length === 0) {
    return null;
  }
  const asset = document.assets.find((item) => item.id === document.coverAssetId);
  return asset?.stillUrl ?? null;
}
