import {
  getBentoBlockSlotCount,
  type BentoBlockType,
} from '../constants/tourBento';
import type { CmsTourLayoutPatch } from '../cms/applyTourLayoutPatch';

export type AdminBentoState = CmsTourLayoutPatch['bento'];
export type AdminBentoBlock = AdminBentoState['blocks'][number];

export function createEmptyBentoBlock(type: BentoBlockType): AdminBentoBlock {
  const count = getBentoBlockSlotCount(type);
  return {
    type,
    slots: Array.from({ length: count }, () => ({ assetId: null })),
  };
}

export function retargetBentoBlock(
  block: AdminBentoBlock,
  nextType: BentoBlockType,
): AdminBentoBlock {
  const count = getBentoBlockSlotCount(nextType);
  const kept = block.slots.slice(0, count);
  while (kept.length < count) {
    kept.push({ assetId: null });
  }
  return { type: nextType, slots: kept };
}

/** Один asset — одна ячейка: снимает id с других слотов. */
export function placeAssetInSlot(
  bento: AdminBentoState,
  blockIndex: number,
  slotIndex: number,
  assetId: string | null,
): AdminBentoState {
  return {
    blocks: bento.blocks.map((block, currentBlock) => ({
      ...block,
      slots: block.slots.map((slot, currentSlot) => {
        if (currentBlock === blockIndex && currentSlot === slotIndex) {
          return { assetId };
        }
        if (assetId != null && slot.assetId === assetId) {
          return { assetId: null };
        }
        return slot;
      }),
    })),
  };
}

export function swapBentoSlots(
  bento: AdminBentoState,
  fromBlock: number,
  fromSlot: number,
  toBlock: number,
  toSlot: number,
): AdminBentoState {
  const source = bento.blocks[fromBlock]?.slots[fromSlot];
  const target = bento.blocks[toBlock]?.slots[toSlot];
  if (source == null || target == null) {
    return bento;
  }
  return {
    blocks: bento.blocks.map((block, blockIndex) => ({
      ...block,
      slots: block.slots.map((slot, slotIndex) => {
        if (blockIndex === fromBlock && slotIndex === fromSlot) {
          return { ...target };
        }
        if (blockIndex === toBlock && slotIndex === toSlot) {
          return { ...source };
        }
        return slot;
      }),
    })),
  };
}

export function setSlotObjectPosition(
  bento: AdminBentoState,
  blockIndex: number,
  slotIndex: number,
  objectPosition: string,
): AdminBentoState {
  return {
    blocks: bento.blocks.map((block, currentBlock) => ({
      ...block,
      slots: block.slots.map((slot, currentSlot) => {
        if (currentBlock !== blockIndex || currentSlot !== slotIndex) {
          return slot;
        }
        return { ...slot, objectPosition };
      }),
    })),
  };
}
