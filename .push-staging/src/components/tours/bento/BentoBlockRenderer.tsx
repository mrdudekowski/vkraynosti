import {
  BENTO_BLOCK_GRID_CLASS,
  BENTO_SINGLE_BLOCK_GRID_CLASS,
  BENTO_SLOT_PLACEMENTS,
} from '../../../constants/tourBento';
import type { BentoBlock } from '../../../types/tourBento';
import BentoMediaTile from './BentoMediaTile';

export interface BentoBlockRendererProps {
  block: BentoBlock;
  tourTitle: string;
  /** Индекс первого слота блока в плоском списке галереи. */
  slotIndexOffset: number;
  prefersReducedMotion?: boolean;
  getVideoPosterForGridSrc?: (gridSrc: string) => string | undefined;
  /** Глобальный индекс первого тайла галереи (для eager-load). */
  firstGalleryTileIndex?: number;
}

const BentoBlockRenderer = ({
  block,
  tourTitle,
  slotIndexOffset,
  prefersReducedMotion = false,
  getVideoPosterForGridSrc,
  firstGalleryTileIndex = 0,
}: BentoBlockRendererProps) => {
  const placements = BENTO_SLOT_PLACEMENTS[block.type];
  const gridClassName =
    block.type === 'bento-single' || block.type === 'bento-wide-square'
      ? BENTO_SINGLE_BLOCK_GRID_CLASS
      : BENTO_BLOCK_GRID_CLASS;

  return (
    <div className={gridClassName}>
      {block.slots.map((slot, slotIndex) => {
        const indexInGrid = slotIndexOffset + slotIndex;
        return (
          <BentoMediaTile
            key={`${block.type}-${indexInGrid}-${slot.src}`}
            slot={slot}
            placement={placements[slotIndex]}
            tourTitle={tourTitle}
            indexInGrid={indexInGrid}
            prefersReducedMotion={prefersReducedMotion}
            getVideoPosterForGridSrc={getVideoPosterForGridSrc}
            isFirstGalleryTile={indexInGrid === firstGalleryTileIndex}
          />
        );
      })}
    </div>
  );
};

export default BentoBlockRenderer;
