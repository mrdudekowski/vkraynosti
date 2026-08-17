import type { CmsTourAsset } from '../cms/cmsTourDocument';

export function cmsAssetHasVideo(asset: Pick<CmsTourAsset, 'videoUrl'>): boolean {
  return asset.videoUrl != null && asset.videoUrl.length > 0;
}
