import {
  cmsTourDocumentSchema,
  type CmsTourDocument,
} from './cmsTourDocument';

export type CmsTourCloneDocumentInput = {
  id: string;
  slug: string;
  season: CmsTourDocument['season'];
  assetIdBySourceId: ReadonlyMap<string, string>;
  assetUrlBySourceUrl: ReadonlyMap<string, string>;
};

function remapAssetId(
  assetId: string | null,
  assetIdBySourceId: ReadonlyMap<string, string>,
): string | null {
  return assetId == null ? null : (assetIdBySourceId.get(assetId) ?? assetId);
}

function remapAssetUrl(
  url: string,
  assetUrlBySourceUrl: ReadonlyMap<string, string>,
): string {
  return assetUrlBySourceUrl.get(url) ?? url;
}

export function cloneCmsTourDocument(
  source: CmsTourDocument,
  input: CmsTourCloneDocumentInput,
): CmsTourDocument {
  const assets = source.assets.map((asset) => ({
    ...asset,
    id: input.assetIdBySourceId.get(asset.id) ?? asset.id,
    stillUrl: remapAssetUrl(asset.stillUrl, input.assetUrlBySourceUrl),
    videoUrl:
      asset.videoUrl == null
        ? null
        : remapAssetUrl(asset.videoUrl, input.assetUrlBySourceUrl),
  }));

  return cmsTourDocumentSchema.parse({
    ...source,
    id: input.id,
    slug: input.slug,
    season: input.season,
    status: 'draft',
    coverAssetId: remapAssetId(source.coverAssetId, input.assetIdBySourceId),
    prefaceAssetId: remapAssetId(source.prefaceAssetId, input.assetIdBySourceId),
    assets,
    bento: {
      blocks: source.bento.blocks.map((block) => ({
        ...block,
        slots: block.slots.map((slot) => ({
          ...slot,
          assetId: remapAssetId(slot.assetId, input.assetIdBySourceId),
        })),
      })),
    },
  });
}
