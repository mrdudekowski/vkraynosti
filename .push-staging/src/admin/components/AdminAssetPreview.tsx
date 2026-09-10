import { Video } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { CmsTourAsset } from '../../cms/cmsTourDocument';
import { cmsAssetHasVideo } from '../cmsAssetHasVideo';
import { ADMIN_UI } from '../constants/ui';
import { resolveMediaObjectPosition } from '../../utils/mediaObjectPosition';
import type { CSSProperties } from 'react';

export const AdminVideoBadge = () => (
  <span
    className="pointer-events-none absolute left-1 top-1 z-stack-base inline-flex h-7 w-7 items-center justify-center rounded-card bg-surface-dark/70 text-text-inverse"
    aria-label={ADMIN_UI.videoBadge}
    title={ADMIN_UI.videoBadge}
  >
    <Video size={16} strokeWidth={1.75} aria-hidden />
  </span>
);

type AdminAssetPreviewProps = {
  asset: CmsTourAsset;
  play: boolean;
  className?: string;
  objectPosition?: string;
};

const AdminAssetPreview = ({ asset, play, className = '', objectPosition }: AdminAssetPreviewProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const resolved = resolveMediaObjectPosition(objectPosition);
  const positionClass =
    resolved.objectPosition != null
      ? 'media-object-position'
      : resolved.className ?? '';
  const positionStyle =
    resolved.objectPosition != null
      ? ({ ['--media-object-position']: resolved.objectPosition } as CSSProperties)
      : undefined;
  const mediaClass = `pointer-events-none h-full w-full object-cover ${className} ${positionClass}`.trim();
  const showVideo = play && cmsAssetHasVideo(asset) && !reducedMotion && asset.videoUrl != null;

  if (showVideo) {
    return (
      <video
        className={mediaClass}
        style={positionStyle}
        src={asset.videoUrl ?? undefined}
        poster={asset.stillUrl ?? undefined}
        muted
        loop
        playsInline
        autoPlay
      />
    );
  }

  return <img src={asset.stillUrl} alt="" className={mediaClass} style={positionStyle} />;
};

export default AdminAssetPreview;
