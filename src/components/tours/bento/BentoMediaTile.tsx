import PlaceholderImage from '../../shared/PlaceholderImage';
import GalleryGridVideo from '../GalleryGridVideo';
import { getBentoSlotTileClassName, type BentoSlotPlacement } from '../../../constants/tourBento';
import type { BentoMediaSlot } from '../../../types/tourBento';
import { isVideoAssetUrl } from '../../../utils/isVideoAssetUrl';

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

function imgClassNameForSlot(slot: BentoMediaSlot): string {
  const position = slot.objectPosition;
  if (position == null || position === '') {
    return '';
  }
  if (position.startsWith('object-')) {
    return position;
  }
  return '';
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
  const imgExtra = imgClassNameForSlot(slot);
  const loading = isFirstGalleryTile ? 'eager' : 'lazy';
  const deferSrcUntilVisible = false;

  if (isVideoAssetUrl(slot.src)) {
    const poster = getVideoPosterForGridSrc?.(slot.src);
    return (
      <GalleryGridVideo
        key={`${slot.src}-${indexInGrid}`}
        gridSrc={slot.src}
        posterSrc={poster}
        className={tileClassName}
        videoObjectClassName={imgExtra.length > 0 ? imgExtra : undefined}
        prefersReducedMotion={prefersReducedMotion}
      />
    );
  }

  return (
    <div
      key={`${slot.src}-${indexInGrid}`}
      className={`overflow-hidden rounded-card ${tileClassName}`}
    >
      <PlaceholderImage
        src={slot.src}
        alt={tileAlt}
        className="h-full w-full"
        imgClassName={imgExtra}
        loading={loading}
        fetchPriority={isFirstGalleryTile ? 'high' : undefined}
        deferSrcUntilVisible={deferSrcUntilVisible}
      />
    </div>
  );
};

export default BentoMediaTile;
