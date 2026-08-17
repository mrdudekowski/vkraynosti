import type { CmsTourAsset, CmsTourDocument } from './cmsTourDocument';

export function reservedTourAssetIds(document: {
  coverAssetId: string | null;
  prefaceAssetId: string | null;
}): Set<string> {
  const reserved = new Set<string>();
  if (document.coverAssetId != null && document.coverAssetId.length > 0) {
    reserved.add(document.coverAssetId);
  }
  if (document.prefaceAssetId != null && document.prefaceAssetId.length > 0) {
    reserved.add(document.prefaceAssetId);
  }
  return reserved;
}

export function bentoPoolAssets(document: CmsTourDocument): CmsTourAsset[] {
  const reserved = reservedTourAssetIds(document);
  return document.assets.filter((asset) => !reserved.has(asset.id));
}

/** Кадры пула, которые ещё не стоят ни в одном слоте bento. */
export function unusedBentoPoolAssets(document: CmsTourDocument): CmsTourAsset[] {
  const used = new Set(
    document.bento.blocks.flatMap((block) =>
      block.slots
        .map((slot) => slot.assetId)
        .filter((assetId): assetId is string => assetId != null && assetId.length > 0),
    ),
  );
  return bentoPoolAssets(document).filter((asset) => !used.has(asset.id));
}
