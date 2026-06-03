import { memo } from 'react';
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
  if (layout.blocks.length === 0) {
    return null;
  }

  let slotIndexOffset = 0;

  return (
    <div className="flex flex-col gap-gallery-gap w-full min-w-0">
      {layout.blocks.map((block, blockIndex) => {
        const offset = slotIndexOffset;
        slotIndexOffset += getBentoBlockSlotCount(block.type);
        return (
          <BentoBlockRenderer
            key={`${block.type}-${blockIndex}`}
            block={block}
            tourTitle={tourTitle}
            slotIndexOffset={offset}
            prefersReducedMotion={prefersReducedMotion}
            getVideoPosterForGridSrc={getVideoPosterForGridSrc}
          />
        );
      })}
    </div>
  );
};

const TourBentoGallery = memo(TourBentoGalleryComponent);

export default TourBentoGallery;
