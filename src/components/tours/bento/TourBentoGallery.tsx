import { memo, useMemo } from 'react';
import type { TourBentoGalleryLayout } from '../../../types/tourBento';
import { getBentoBlockSlotCount } from '../../../constants/tourBento';
import BentoBlockRenderer from './BentoBlockRenderer';

export interface TourBentoGalleryProps {
  layout: TourBentoGalleryLayout;
  tourTitle: string;
  prefersReducedMotion?: boolean;
  getVideoPosterForGridSrc?: (gridSrc: string) => string | undefined;
}

const TourBentoGalleryComponent = ({
  layout,
  tourTitle,
  prefersReducedMotion = false,
  getVideoPosterForGridSrc,
}: TourBentoGalleryProps) => {
  const blocksWithOffsets = useMemo(
    () =>
      layout.blocks.map((block, blockIndex) => ({
        block,
        blockIndex,
        slotIndexOffset: layout.blocks
          .slice(0, blockIndex)
          .reduce((sum, prior) => sum + getBentoBlockSlotCount(prior.type), 0),
      })),
    [layout.blocks]
  );

  if (blocksWithOffsets.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-gallery-gap w-full min-w-0">
      {blocksWithOffsets.map(({ block, blockIndex, slotIndexOffset }) => (
        <BentoBlockRenderer
          key={`${block.type}-${blockIndex}`}
          block={block}
          tourTitle={tourTitle}
          slotIndexOffset={slotIndexOffset}
          prefersReducedMotion={prefersReducedMotion}
          getVideoPosterForGridSrc={getVideoPosterForGridSrc}
        />
      ))}
    </div>
  );
};

const TourBentoGallery = memo(TourBentoGalleryComponent);

export default TourBentoGallery;
