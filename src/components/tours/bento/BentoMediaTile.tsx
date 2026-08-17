import PlaceholderImage from '../../shared/PlaceholderImage';
import GalleryGridVideo from '../GalleryGridVideo';
import { getBentoSlotTileClassName, type BentoSlotPlacement } from '../../../constants/tourBento';
import type { BentoMediaSlot } from '../../../types/tourBento';
import { isVideoAssetUrl } from '../../../utils/isVideoAssetUrl';
import { resolveMediaObjectPosition } from '../../../utils/mediaObjectPosition';
import type { CSSProperties } from 'react';

export interface BentoMediaTileProps {
  slot: BentoMediaSlot;
  placement: BentoSlotPlacement;
  tourTitle: string;
  indexInGrid: number;
  prefersReducedMotion?: boolean;
  getVideoPosterForGridSrc?: (gridSrc: string) => string | undefined;
  /** Первый тайл галереи — eager + high fetch priority. */
  isFirstGalleryTile?: boolean;
}

function slotPositionProps(slot: BentoMediaSlot): {
  className?: string;
  style?: CSSProperties;
  imgClassName?: string;
} {
  const resolved = resolveMediaObjectPosition(slot.objectPosition);
  if (resolved.objectPosition != null) {
    return {
      className: 'media-object-position',
      style: { ['--media-object-position']: resolved.objectPosition } as CSSProperties,
    };
  }
  if (resolved.className != null) {
    return { imgClassName: resolved.className };
  }
  return {};
}

const BentoMediaTile = ({
  slot,
  placement,
  tourTitle,
  indexInGrid,
  prefersReducedMotion = false,
  getVideoPosterForGridSrc,
  isFirstGalleryTile = false,
}: BentoMediaTileProps) => {
  const tileClassName = getBentoSlotTileClassName(placement);
  const tileAlt = slot.alt ?? `${tourTitle} — фото ${indexInGrid + 1}`;
  const position = slotPositionProps(slot);
  const loading = isFirstGalleryTile ? 'eager' : 'lazy';
  const deferSrcUntilVisible = false;

  if (isVideoAssetUrl(slot.src)) {
    const poster = getVideoPosterForGridSrc?.(slot.src);
    return (
      <GalleryGridVideo
        key={`${slot.src}-${indexInGrid}`}
        gridSrc={slot.src}
        posterSrc={poster}
        className={`${tileClassName} ${position.className ?? ''}`.trim()}
        style={position.style}
        videoObjectClassName={position.imgClassName}
        prefersReducedMotion={prefersReducedMotion}
      />
    );
  }

  return (
    <div
      key={`${slot.src}-${indexInGrid}`}
      className={`overflow-hidden rounded-card ${tileClassName} ${position.className ?? ''}`.trim()}
      style={position.style}
    >
      <PlaceholderImage
        src={slot.src}
        alt={tileAlt}
        className="h-full w-full"
        imgClassName={position.imgClassName}
        loading={loading}
        fetchPriority={isFirstGalleryTile ? 'high' : undefined}
        deferSrcUntilVisible={deferSrcUntilVisible}
      />
    </div>
  );
};

export default BentoMediaTile;
